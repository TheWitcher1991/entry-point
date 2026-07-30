from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.auth.models import User
from app.services.companies.models import Company
from app.services.messages.models import TaskMessage
from app.services.messages.schemas import MessageCreate, MessageResponse
from app.services.messages.service import create_message, get_task_messages
from app.services.participants.models import ParticipantProfile
from app.services.participations.models import Participation
from app.services.tasks.models import ProjectTask

router = APIRouter(prefix="/tasks/{task_id}/messages", tags=["messages"])


async def _check_task_access(
    db: AsyncSession,
    task_id: int,
    current_user: User,
) -> ProjectTask:
    """Verify the task exists and the user has access (company owner or participant)."""
    query = (
        select(ProjectTask)
        .options(selectinload(ProjectTask.company))
        .where(ProjectTask.id == task_id)
    )
    result = await db.execute(query)
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if current_user.role == "company":
        company = await _get_company_by_user(db, current_user.id)
        if company is None or task.company_id != company.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your task")
        return task

    if current_user.role == "participant":
        participant = await _get_participant_by_user(db, current_user.id)
        if participant is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Participant profile not found"
            )

        p_result = await db.execute(
            select(Participation).where(
                Participation.task_id == task_id,
                Participation.participant_id == participant.id,
                Participation.status.in_(["active", "completed"]),
            )
        )
        if p_result.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not participating in this task"
            )
        return task

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")


async def _get_company_by_user(db: AsyncSession, user_id: int) -> Company | None:
    result = await db.execute(select(Company).where(Company.owner_id == user_id))
    return result.scalar_one_or_none()


async def _get_participant_by_user(db: AsyncSession, user_id: int) -> ParticipantProfile | None:
    query = select(ParticipantProfile).where(ParticipantProfile.user_id == user_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()


def _enrich_message(msg: TaskMessage) -> MessageResponse:
    return MessageResponse(
        id=msg.id,
        task_id=msg.task_id,
        sender_id=msg.sender_id,
        sender_first_name=msg.sender.first_name if msg.sender else None,
        sender_last_name=msg.sender.last_name if msg.sender else None,
        sender_role=msg.sender.role if msg.sender else None,
        participant_profile_id=msg.participant_profile_id,
        text=msg.text,
        created_at=msg.created_at,
    )


@router.get("", response_model=list[MessageResponse])
async def list_task_messages(
    task_id: int,
    participant_profile_id: int | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[MessageResponse]:
    """Get messages for a task. Company can filter by participant; participant sees their own."""
    await _check_task_access(db, task_id, current_user)

    if current_user.role == "participant":
        participant = await _get_participant_by_user(db, current_user.id)
        if participant is not None:
            participant_profile_id = participant.id

    messages = await get_task_messages(db, task_id, participant_profile_id=participant_profile_id)
    return [_enrich_message(m) for m in messages]


@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    task_id: int,
    body: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    """Send a message in a task conversation."""
    await _check_task_access(db, task_id, current_user)

    participant_profile_id = body.participant_profile_id

    if current_user.role == "participant":
        participant = await _get_participant_by_user(db, current_user.id)
        if participant is not None:
            participant_profile_id = participant.id

    if current_user.role == "company" and participant_profile_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="participant_profile_id is required for company messages",
        )

    msg = await create_message(
        db,
        task_id=task_id,
        sender_id=current_user.id,
        text=body.text,
        participant_profile_id=participant_profile_id,
    )
    return _enrich_message(msg)


@router.get("/participants", response_model=list[dict[str, object]])
async def list_conversation_participants(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, object]]:
    """List distinct participants the company can chat with about this task."""
    await _check_task_access(db, task_id, current_user)

    if current_user.role != "company":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Only company can list participants"
        )

    from app.services.messages.models import TaskMessage

    # Get distinct participant_profile_ids from messages for this task
    msg_result = await db.execute(
        select(TaskMessage.participant_profile_id)
        .where(
            TaskMessage.task_id == task_id,
            TaskMessage.participant_profile_id.isnot(None),
        )
        .distinct()
    )
    participant_ids = [row[0] for row in msg_result.all()]

    # Also get active participations
    p_result = await db.execute(
        select(Participation).options(
            selectinload(Participation.participant_profile)
        ).where(
            Participation.task_id == task_id,
            Participation.status.in_(["active", "completed"]),
        )
    )
    participations = p_result.scalars().all()

    seen = set(participant_ids)
    result = []
    for p in participations:
        pp = p.participant_profile
        if pp is None or pp.id in seen:
            continue
        seen.add(pp.id)
        user = pp.user
        result.append({
            "id": pp.id,
            "first_name": user.first_name if user else "",
            "last_name": user.last_name if user else "",
        })

    # Add participants from messages that might not have active participation
    for pid in participant_ids:
        if pid is None or pid in {r["id"] for r in result}:
            continue
        query = (
            select(ParticipantProfile)
            .options(selectinload(ParticipantProfile.user))
            .where(ParticipantProfile.id == pid)
        )
        pp_result = await db.execute(query)
        pp = pp_result.scalar_one_or_none()
        if pp and pp.user:
            if pid not in {r["id"] for r in result}:
                result.append({
                    "id": pp.id,
                    "first_name": pp.user.first_name or "",
                    "last_name": pp.user.last_name or "",
                })

    return result
