from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.applications.models import Application
from app.services.applications.schemas import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
)
from app.services.applications.service import (
    create_application,
    get_application_by_id,
    get_applications_for_company_tasks,
    get_my_applications,
    get_task_applications,
    update_application_status,
)
from app.services.auth.models import User, UserRole
from app.services.companies.models import Company
from app.services.participants.models import ParticipantProfile
from app.services.tasks.models import ProjectTask

router = APIRouter(prefix="/applications", tags=["applications"])


async def _get_participant_profile(
    db: AsyncSession, user_id: int
) -> ParticipantProfile | None:
    result = await db.execute(
        select(ParticipantProfile).where(ParticipantProfile.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def _get_company(db: AsyncSession, owner_id: int) -> Company | None:
    result = await db.execute(
        select(Company).where(Company.owner_id == owner_id)
    )
    return result.scalar_one_or_none()


async def _require_participant(
    current_user: User, db: AsyncSession
) -> int:
    """Return participant_profile_id or raise 403."""
    if current_user.role != UserRole.PARTICIPANT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Participant access required",
        )
    profile = await _get_participant_profile(db, current_user.id)
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Participant profile not found. Complete your profile first.",
        )
    return profile.id


async def _require_company(
    current_user: User, db: AsyncSession
) -> int:
    """Return company_id or raise 403."""
    if current_user.role != UserRole.COMPANY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Company access required",
        )
    company = await _get_company(db, current_user.id)
    if company is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company profile not found.",
        )
    return company.id


# ── Participant endpoints ──


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def apply_to_task(
    body: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ApplicationResponse:
    participant_id = await _require_participant(current_user, db)

    # Check task exists
    task = await db.get(ProjectTask, body.task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Check for duplicate application
    existing = await db.execute(
        select(Application).where(
            Application.task_id == body.task_id,
            Application.participant_id == participant_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already applied to this task",
        )

    app = await create_application(db, participant_id, body.task_id, body.cover_letter)
    # app should not be None since we already verified task exists above
    assert app is not None

    resp = ApplicationResponse.model_validate(app)
    resp.task_title = app.task.title if app.task else None
    return resp


@router.get("/my", response_model=list[ApplicationResponse])
async def get_my_applications_endpoint(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ApplicationResponse]:
    participant_id = await _require_participant(current_user, db)

    apps = await get_my_applications(db, participant_id)
    result = []
    for app in apps:
        resp = ApplicationResponse.model_validate(app)
        resp.task_title = app.task.title if app.task else None
        result.append(resp)
    return result


# ── Company endpoints ──


@router.get("/task/{task_id}", response_model=list[ApplicationResponse])
async def get_task_applications_endpoint(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ApplicationResponse]:
    company_id = await _require_company(current_user, db)

    # Verify task belongs to company
    from app.services.tasks.service import get_task_by_id as get_task

    task = await get_task(db, task_id)
    if task is None or task.company_id != company_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or not owned by you",
        )

    apps = await get_task_applications(db, task_id)
    result = []
    for app in apps:
        resp = ApplicationResponse.model_validate(app)
        profile = app.participant_profile
        if profile:
            resp.participant_first_name = profile.first_name
            resp.participant_last_name = profile.last_name
        result.append(resp)
    return result


@router.get("/company", response_model=list[ApplicationResponse])
async def get_company_applications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ApplicationResponse]:
    """Get all applications for all tasks owned by the company."""
    company_id = await _require_company(current_user, db)

    apps = await get_applications_for_company_tasks(db, company_id)
    result = []
    for app in apps:
        resp = ApplicationResponse.model_validate(app)
        resp.task_title = app.task.title if app.task else None
        profile = app.participant_profile
        if profile:
            resp.participant_first_name = profile.first_name
            resp.participant_last_name = profile.last_name
        result.append(resp)
    return result


# ── Status update (company approves/rejects, participant withdraws) ──


@router.patch("/{application_id}/status", response_model=ApplicationResponse)
async def change_application_status(
    application_id: int,
    body: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ApplicationResponse:
    app = await get_application_by_id(db, application_id)
    if app is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    # Participant can only withdraw their own application
    if current_user.role == UserRole.PARTICIPANT:
        if body.status != "withdrawn":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Participants can only withdraw their applications",
            )
        profile = await _get_participant_profile(db, current_user.id)
        if profile is None or app.participant_id != profile.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not your application",
            )

    # Company can approve/reject applications for their task
    elif current_user.role == UserRole.COMPANY:
        company = await _get_company(db, current_user.id)
        if company is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company profile not found.",
            )
        task = app.task
        if task is None or task.company_id != company.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Application not for your task",
            )

    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    updated = await update_application_status(db, application_id, body.status)
    assert updated is not None  # already confirmed existence above

    resp = ApplicationResponse.model_validate(updated)
    resp.task_title = updated.task.title if updated.task else None
    profile = updated.participant_profile
    if profile:
        resp.participant_first_name = profile.first_name
        resp.participant_last_name = profile.last_name
    return resp
