from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.auth.models import User, UserRole
from app.services.tasks.schemas import (
    TaskCreate,
    TaskListItem,
    TaskResponse,
    TaskStatusUpdate,
    TaskUpdate,
)
from app.services.tasks.service import (
    create_task,
    get_company_tasks,
    get_task_by_id,
    list_tasks,
    update_task,
    update_task_status,
)

router = APIRouter(prefix="/tasks", tags=["tasks"])


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
        difficulty=difficulty,
        format=format,
        search=search,
        sort=sort,
        offset=offset,
        limit=limit,
    )
    return [TaskListItem.model_validate(t) for t in tasks]


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


# ── Company endpoints ──


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_new_task(
    body: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TaskResponse:
    require_company(current_user)
    company = current_user.company
    if company is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company profile not found. Create a company profile first.",
        )
    task = await create_task(db, company.id, body.model_dump())
    return TaskResponse.model_validate(task)


@router.get("/my", response_model=list[TaskListItem])
async def get_my_company_tasks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[TaskListItem]:
    require_company(current_user)
    company = current_user.company
    if company is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company profile not found.",
        )
    tasks = await get_company_tasks(db, company.id)
    return [TaskListItem.model_validate(t) for t in tasks]


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_my_task(
    task_id: int,
    body: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TaskResponse:
    require_company(current_user)
    company = current_user.company
    if company is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company profile not found.",
        )
    task = await update_task(db, task_id, company.id, body.model_dump(exclude_none=True))
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or not owned by you",
        )
    return TaskResponse.model_validate(task)


@router.patch("/{task_id}/status", response_model=TaskResponse)
async def change_task_status(
    task_id: int,
    body: TaskStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TaskResponse:
    company = current_user.company
    is_company = current_user.role == UserRole.COMPANY and company is not None
    is_admin = current_user.role == UserRole.ADMIN

    if not is_company and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Company or admin access required",
        )

    if is_company and not is_admin:
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
