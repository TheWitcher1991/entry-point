from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.auth.models import User, UserRole
from app.services.companies.models import Company
from app.services.participants.models import ParticipantProfile
from app.services.tasks.schemas import (
    SubmissionCreate,
    SubmissionResponse,
    SubmissionReview,
    TaskCreate,
    TaskListItem,
    TaskResponse,
    TaskStatusUpdate,
    TaskUpdate,
)
from app.services.tasks.service import (
    create_submission,
    create_task,
    get_company_tasks,
    get_task_by_id,
    get_task_submissions,
    list_tasks,
    review_submission,
    update_task,
    update_task_status,
)

router = APIRouter(prefix="/tasks", tags=["tasks"])


async def _get_company(db: AsyncSession, owner_id: int) -> Company | None:
    """Explicit company fetch (avoids lazy loading issues with aiosqlite)."""
    result = await db.execute(
        select(Company).where(Company.owner_id == owner_id)
    )
    return result.scalar_one_or_none()


async def _get_participant_profile(
    db: AsyncSession, user_id: int
) -> ParticipantProfile | None:
    """Explicit participant profile fetch (avoids lazy loading with aiosqlite)."""
    result = await db.execute(
        select(ParticipantProfile).where(ParticipantProfile.user_id == user_id)
    )
    return result.scalar_one_or_none()


def require_company(current_user: User) -> None:
    if current_user.role != UserRole.COMPANY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Company access required",
        )


def require_admin(current_user: User) -> None:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )


# ── Public endpoints ──


@router.get("", response_model=list[TaskListItem])
async def list_public_tasks(
    status: str = Query("open", description="Filter by status"),
    category_id: int | None = Query(None),
    company_id: int | None = Query(None),
    difficulty: str | None = Query(None),
    format: str | None = Query(None),
    search: str | None = Query(None, min_length=2),
    sort: str = Query("newest", pattern=r"^(newest|deadline|popular)$"),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> list[TaskListItem]:
    tasks = await list_tasks(
        db,
        status=status,
        category_id=category_id,
        company_id=company_id,
        difficulty=difficulty,
        format=format,
        search=search,
        sort=sort,
        offset=offset,
        limit=limit,
    )
    return [TaskListItem.model_validate(t) for t in tasks]


# ── Fixed-path routes MUST come before parameterised routes ──


@router.get("/my", response_model=list[TaskListItem])
async def get_my_company_tasks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[TaskListItem]:
    require_company(current_user)
    company = await _get_company(db, current_user.id)
    if company is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company profile not found.",
        )
    tasks = await get_company_tasks(db, company.id)
    return [TaskListItem.model_validate(t) for t in tasks]


# ── Parameterised routes ──


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
) -> TaskResponse:
    task = await get_task_by_id(db, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return TaskResponse.model_validate(task)


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_new_task(
    body: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TaskResponse:
    require_company(current_user)
    company = await _get_company(db, current_user.id)
    if company is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company profile not found. Create a company profile first.",
        )
    task = await create_task(db, company.id, body.model_dump())
    return TaskResponse.model_validate(task)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_my_task(
    task_id: int,
    body: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TaskResponse:
    require_company(current_user)
    company = await _get_company(db, current_user.id)
    if company is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company profile not found.",
        )
    task = await update_task(db, task_id, company.id, body.model_dump(exclude_none=True))
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return TaskResponse.model_validate(task)


# ── Submission endpoints ──


@router.post(
    "/{task_id}/submit",
    response_model=SubmissionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def submit_task_result(
    task_id: int,
    body: SubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SubmissionResponse:
    if current_user.role != UserRole.PARTICIPANT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Participant access required",
        )
    profile = await _get_participant_profile(db, current_user.id)
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Participant profile not found.",
        )

    sub = await create_submission(
        db, task_id, profile.id, body.description, body.result_links
    )
    if sub is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task not found or not in progress",
        )

    resp = SubmissionResponse.model_validate(sub)
    resp.participant_first_name = profile.first_name
    resp.participant_last_name = profile.last_name
    return resp


@router.get("/{task_id}/submissions", response_model=list[SubmissionResponse])
async def get_submissions(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[SubmissionResponse]:
    require_company(current_user)
    company = await _get_company(db, current_user.id)
    if company is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company profile not found.",
        )

    # Verify ownership
    task = await get_task_by_id(db, task_id)
    if task is None or task.company_id != company.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or not owned by you",
        )

    subs = await get_task_submissions(db, task_id)
    result = []
    for sub in subs:
        resp = SubmissionResponse.model_validate(sub)
        profile = sub.participant_profile
        if profile:
            resp.participant_first_name = profile.first_name
            resp.participant_last_name = profile.last_name
        result.append(resp)
    return result


@router.patch(
    "/{task_id}/submissions/{submission_id}/review",
    response_model=SubmissionResponse,
)
async def review_submission_endpoint(
    task_id: int,
    submission_id: int,
    body: SubmissionReview,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SubmissionResponse:
    require_company(current_user)
    company = await _get_company(db, current_user.id)
    if company is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company profile not found.",
        )

    # Verify task ownership
    task = await get_task_by_id(db, task_id)
    if task is None or task.company_id != company.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or not owned by you",
        )

    sub = await review_submission(db, submission_id, body.status, body.review_comment)
    if sub is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found",
        )

    resp = SubmissionResponse.model_validate(sub)
    profile = sub.participant_profile
    if profile:
        resp.participant_first_name = profile.first_name
        resp.participant_last_name = profile.last_name
    return resp


@router.patch("/{task_id}/status", response_model=TaskResponse)
async def change_task_status(
    task_id: int,
    body: TaskStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TaskResponse:
    is_admin = current_user.role == UserRole.ADMIN
    is_company_user = current_user.role == UserRole.COMPANY

    company: Company | None = None
    if is_company_user:
        company = await _get_company(db, current_user.id)

    has_company = company is not None

    if not has_company and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Company or admin access required",
        )

    if company is not None and not is_admin:
        task = await get_task_by_id(db, task_id)
        if task is None or task.company_id != company.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or not owned by you",
            )

    task = await update_task_status(db, task_id, body.status)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return TaskResponse.model_validate(task)
