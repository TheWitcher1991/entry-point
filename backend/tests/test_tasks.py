"""Tests for tasks CRUD, listing, submissions, and role guards.

All tests use real PostgreSQL (see conftest.py).
Each test runs in an isolated transaction that is rolled back.
"""

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.helpers import (
    create_admin,
    register_company,
    register_participant,
)

# ── Public listing ──


class TestPublicListing:
    async def _create_company_task(
        self, client: AsyncClient, token: str, title: str = "Test Task", **overrides
    ) -> dict:
        """Helper: create a task and return the response JSON."""
        payload = {
            "title": title,
            "summary": "A test task summary",
            "difficulty": "beginner",
            "format": "remote",
            "participant_limit": 2,
            "status": "open",
            **overrides,
        }
        resp = await client.post(
            "/api/v1/tasks",
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 201, f"Task create failed: {resp.text}"
        return resp.json()

    async def test_list_tasks_empty(self, client: AsyncClient) -> None:
        """Initially there are no tasks."""
        resp = await client.get("/api/v1/tasks")
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_list_tasks_returns_open_only(
        self, client: AsyncClient
    ) -> None:
        """Default listing returns only 'open' tasks."""
        token, _ = await register_company(client)
        task = await self._create_company_task(client, token)

        # Task should appear in listing
        resp = await client.get("/api/v1/tasks")
        assert resp.status_code == 200
        titles = [t["title"] for t in resp.json()]
        assert task["title"] in titles

    async def test_list_tasks_excludes_draft(
        self, client: AsyncClient
    ) -> None:
        """Draft tasks are not returned in public listing."""
        token, _ = await register_company(client)
        await self._create_company_task(
            client, token, title="Draft Task", status="draft"
        )

        resp = await client.get("/api/v1/tasks")
        titles = [t["title"] for t in resp.json()]
        assert "Draft Task" not in titles

    async def test_list_tasks_with_company_id_filter(
        self, client: AsyncClient
    ) -> None:
        """Filter tasks by company_id."""
        token1, _ = await register_company(client, "comp1@test.com")
        token2, _ = await register_company(client, "comp2@test.com")

        t1 = await self._create_company_task(client, token1, title="Comp1 Task")

        await self._create_company_task(client, token2, title="Comp2 Task")

        # Get company1's ID from the task response
        comp_id = t1["company_id"]

        resp = await client.get(f"/api/v1/tasks?company_id={comp_id}")
        assert resp.status_code == 200
        titles = [t["title"] for t in resp.json()]
        assert "Comp1 Task" in titles
        assert "Comp2 Task" not in titles

    async def test_list_tasks_pagination(
        self, client: AsyncClient
    ) -> None:
        """Offset and limit work correctly."""
        token, _ = await register_company(client)
        for i in range(5):
            await self._create_company_task(
                client, token, title=f"Task {i}"
            )

        resp = await client.get("/api/v1/tasks?offset=0&limit=2")
        assert resp.status_code == 200
        assert len(resp.json()) == 2

    async def test_list_tasks_search(
        self, client: AsyncClient
    ) -> None:
        """Search filters by title."""
        token, _ = await register_company(client, "searchcomp@test.com")
        await self._create_company_task(
            client, token, title="Python API Development"
        )
        await self._create_company_task(
            client, token, title="React Frontend"
        )

        resp = await client.get("/api/v1/tasks?search=python")
        assert resp.status_code == 200
        titles = [t["title"] for t in resp.json()]
        assert "Python API Development" in titles
        assert "React Frontend" not in titles

    async def test_list_tasks_company_name_included(
        self, client: AsyncClient
    ) -> None:
        """Listed tasks include company_name."""
        token, _ = await register_company(client, "named@test.com")
        task = await self._create_company_task(client, token)

        resp = await client.get("/api/v1/tasks")
        data = resp.json()
        found = next(t for t in data if t["id"] == task["id"])
        assert found["company_name"] is not None


# ── Get single task ──


class TestGetTask:
    async def test_get_task_not_found(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/tasks/99999")
        assert resp.status_code == 404

    async def test_get_task_success(self, client: AsyncClient) -> None:
        token, _ = await register_company(client, "getcomp@test.com")
        # Create
        create_resp = await client.post(
            "/api/v1/tasks",
            json={
                "title": "Get Me",
                "summary": "Fetch this task",
                "difficulty": "intermediate",
                "status": "open",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        task_id = create_resp.json()["id"]

        # Get
        resp = await client.get(f"/api/v1/tasks/{task_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "Get Me"
        assert data["company_name"] is not None
        assert "skills" in data


# ── Create task (company only) ──


class TestCreateTask:
    async def test_create_task_unauthenticated(
        self, client: AsyncClient
    ) -> None:
        resp = await client.post(
            "/api/v1/tasks",
            json={"title": "Hacked", "status": "open"},
        )
        assert resp.status_code == 401

    async def test_create_task_participant_forbidden(
        self, client: AsyncClient
    ) -> None:
        token, _ = await register_participant(client)
        resp = await client.post(
            "/api/v1/tasks",
            json={"title": "Not allowed", "status": "open"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 403

    async def test_create_task_success(self, client: AsyncClient) -> None:
        token, _ = await register_company(client, "createcomp@test.com")
        resp = await client.post(
            "/api/v1/tasks",
            json={
                "title": "New Task",
                "summary": "Brand new",
                "difficulty": "advanced",
                "format": "remote",
                "participant_limit": 3,
                "status": "draft",
                "description": "Full description here",
                "requirements": "Must know Python",
                "skills": [{"skill_id": 1, "level": "junior", "is_required": True}],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "New Task"
        assert data["status"] == "draft"
        assert data["difficulty"] == "advanced"
        assert data["company_name"] is not None


# ── My company tasks ──


class TestMyCompanyTasks:
    async def test_my_tasks_unauthenticated(
        self, client: AsyncClient
    ) -> None:
        resp = await client.get("/api/v1/tasks/my")
        assert resp.status_code == 401

    async def test_my_tasks_participant_forbidden(
        self, client: AsyncClient
    ) -> None:
        token, _ = await register_participant(client, "part-my@test.com")
        resp = await client.get(
            "/api/v1/tasks/my",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 403

    async def test_my_tasks_returns_own_tasks(
        self, client: AsyncClient
    ) -> None:
        token, _ = await register_company(client, "mycomp@test.com")
        await client.post(
            "/api/v1/tasks",
            json={"title": "My Task", "status": "open"},
            headers={"Authorization": f"Bearer {token}"},
        )

        resp = await client.get(
            "/api/v1/tasks/my",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        titles = [t["title"] for t in resp.json()]
        assert "My Task" in titles


# ── Update task ──


class TestUpdateTask:
    async def test_update_task_wrong_company(
        self, client: AsyncClient
    ) -> None:
        t1, _ = await register_company(client, "owner@test.com")
        create_resp = await client.post(
            "/api/v1/tasks",
            json={"title": "Owned", "status": "open"},
            headers={"Authorization": f"Bearer {t1}"},
        )
        task_id = create_resp.json()["id"]

        t2, _ = await register_company(client, "intruder@test.com")
        resp = await client.patch(
            f"/api/v1/tasks/{task_id}",
            json={"title": "Hacked"},
            headers={"Authorization": f"Bearer {t2}"},
        )
        assert resp.status_code == 404

    async def test_update_task_success(self, client: AsyncClient) -> None:
        token, _ = await register_company(client, "updcomp@test.com")
        create_resp = await client.post(
            "/api/v1/tasks",
            json={"title": "Original", "status": "draft"},
            headers={"Authorization": f"Bearer {token}"},
        )
        task_id = create_resp.json()["id"]

        resp = await client.patch(
            f"/api/v1/tasks/{task_id}",
            json={
                "title": "Updated",
                "summary": "Updated summary",
                "difficulty": "advanced",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "Updated"
        assert data["summary"] == "Updated summary"
        assert data["difficulty"] == "advanced"

    async def test_update_task_add_skills(self, client: AsyncClient) -> None:
        token, _ = await register_company(client, "skillcomp@test.com")
        create_resp = await client.post(
            "/api/v1/tasks",
            json={"title": "Skill Task", "status": "draft"},
            headers={"Authorization": f"Bearer {token}"},
        )
        task_id = create_resp.json()["id"]

        resp = await client.patch(
            f"/api/v1/tasks/{task_id}",
            json={
                "skills": [
                    {"skill_id": 1, "level": "junior", "is_required": True},
                    {"skill_id": 2, "level": "senior", "is_required": False},
                ]
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert len(resp.json()["skills"]) == 2


# ── Status management ──


class TestTaskStatus:
    async def test_change_status(self, client: AsyncClient) -> None:
        token, _ = await register_company(client, "statcomp@test.com")
        create_resp = await client.post(
            "/api/v1/tasks",
            json={"title": "Status Task", "status": "draft"},
            headers={"Authorization": f"Bearer {token}"},
        )
        task_id = create_resp.json()["id"]

        resp = await client.patch(
            f"/api/v1/tasks/{task_id}/status",
            json={"status": "open"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "open"

    async def test_change_status_unauthenticated(
        self, client: AsyncClient
    ) -> None:
        resp = await client.patch(
            "/api/v1/tasks/1/status",
            json={"status": "open"},
        )
        assert resp.status_code == 401

    async def test_admin_can_change_status(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """Admin can change any task's status."""
        # Create a task as company
        token, _ = await register_company(client, "admtask@test.com")
        create_resp = await client.post(
            "/api/v1/tasks",
            json={"title": "Admin Task", "status": "draft"},
            headers={"Authorization": f"Bearer {token}"},
        )
        task_id = create_resp.json()["id"]

        # Create admin directly in DB and login
        admin = await create_admin(db_session, "admin-task@test.com")
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": admin.email, "password": "admin123"},
        )
        admin_token = login_resp.json()["access_token"]

        resp = await client.patch(
            f"/api/v1/tasks/{task_id}/status",
            json={"status": "published"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "published"


# ── Submissions ──


class TestSubmissions:
    async def _setup_task_in_progress(
        self, client: AsyncClient
    ) -> tuple[str, str, int]:
        """Create company + task + participant with active participation."""
        ct, _ = await register_company(client, "subcomp@test.com")
        create = await client.post(
            "/api/v1/tasks",
            json={"title": "Sub Task", "status": "open", "participant_limit": 1},
            headers={"Authorization": f"Bearer {ct}"},
        )
        task_id = create.json()["id"]

        pt, _ = await register_participant(client, "subpart@test.com")
        # Ensure participant profile exists and set a name
        await client.get(
            "/api/v1/participants/me",
            headers={"Authorization": f"Bearer {pt}"},
        )
        await client.patch(
            "/api/v1/participants/me",
            json={"first_name": "Test", "last_name": "Submitter"},
            headers={"Authorization": f"Bearer {pt}"},
        )

        # Apply and approve to create participation record
        app_resp = await client.post(
            "/api/v1/applications",
            json={"task_id": task_id},
            headers={"Authorization": f"Bearer {pt}"},
        )
        app_id = app_resp.json()["id"]
        await client.patch(
            f"/api/v1/applications/{app_id}/status",
            json={"status": "approved"},
            headers={"Authorization": f"Bearer {ct}"},
        )

        # Set task to in_progress for submission
        await client.patch(
            f"/api/v1/tasks/{task_id}/status",
            json={"status": "in_progress"},
            headers={"Authorization": f"Bearer {ct}"},
        )
        return ct, pt, task_id

    async def test_submit_unauthenticated(self, client: AsyncClient) -> None:
        resp = await client.post(
            "/api/v1/tasks/1/submit",
            json={"description": "Done"},
        )
        assert resp.status_code == 401

    async def test_submit_company_forbidden(
        self, client: AsyncClient
    ) -> None:
        ct, _, task_id = await self._setup_task_in_progress(client)
        resp = await client.post(
            f"/api/v1/tasks/{task_id}/submit",
            json={"description": "My result"},
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 403

    async def test_submit_success(self, client: AsyncClient) -> None:
        ct, pt, task_id = await self._setup_task_in_progress(client)
        resp = await client.post(
            f"/api/v1/tasks/{task_id}/submit",
            json={
                "description": "Completed the task",
                "result_links": "https://github.com/my/repo",
            },
            headers={"Authorization": f"Bearer {pt}"},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["description"] == "Completed the task"
        assert data["result_links"] == "https://github.com/my/repo"
        assert data["status"] == "pending"
        assert data["participant_first_name"] is not None

    async def test_submit_not_in_progress(
        self, client: AsyncClient
    ) -> None:
        """Cannot submit to a task that is not in_progress."""
        ct, _ = await register_company(client, "noprogress@test.com")
        create = await client.post(
            "/api/v1/tasks",
            json={"title": "Not In Progress", "status": "open"},
            headers={"Authorization": f"Bearer {ct}"},
        )
        task_id = create.json()["id"]

        pt, _ = await register_participant(client, "nopart@test.com")
        await client.get(
            "/api/v1/participants/me",
            headers={"Authorization": f"Bearer {pt}"},
        )

        resp = await client.post(
            f"/api/v1/tasks/{task_id}/submit",
            json={"description": "Result"},
            headers={"Authorization": f"Bearer {pt}"},
        )
        assert resp.status_code == 400

    async def test_get_submissions_company_only(
        self, client: AsyncClient
    ) -> None:
        ct, pt, task_id = await self._setup_task_in_progress(client)
        # Submit
        await client.post(
            f"/api/v1/tasks/{task_id}/submit",
            json={"description": "Done"},
            headers={"Authorization": f"Bearer {pt}"},
        )

        # Participant cannot list submissions
        resp = await client.get(
            f"/api/v1/tasks/{task_id}/submissions",
            headers={"Authorization": f"Bearer {pt}"},
        )
        assert resp.status_code == 403

        # Company can
        resp = await client.get(
            f"/api/v1/tasks/{task_id}/submissions",
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    async def test_review_approve(self, client: AsyncClient) -> None:
        """Company approves submission → status becomes 'completed'."""
        ct, pt, task_id = await self._setup_task_in_progress(client)
        sub_resp = await client.post(
            f"/api/v1/tasks/{task_id}/submit",
            json={"description": "Done"},
            headers={"Authorization": f"Bearer {pt}"},
        )
        sub_id = sub_resp.json()["id"]

        # Company reviews
        resp = await client.patch(
            f"/api/v1/tasks/{task_id}/submissions/{sub_id}/review",
            json={"status": "approved", "review_comment": "Great work!"},
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "approved"
        assert resp.json()["review_comment"] == "Great work!"

        # Task should be completed now
        task_resp = await client.get(f"/api/v1/tasks/{task_id}")
        assert task_resp.json()["status"] == "completed"
        assert task_resp.json()["participant_count"] == 1

    async def test_review_reject(self, client: AsyncClient) -> None:
        """Company rejects submission → task goes to rework."""
        ct, pt, task_id = await self._setup_task_in_progress(client)
        sub_resp = await client.post(
            f"/api/v1/tasks/{task_id}/submit",
            json={"description": "Needs fixes"},
            headers={"Authorization": f"Bearer {pt}"},
        )
        sub_id = sub_resp.json()["id"]

        resp = await client.patch(
            f"/api/v1/tasks/{task_id}/submissions/{sub_id}/review",
            json={"status": "rejected", "review_comment": "Please fix the tests"},
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "rejected"

        # Task should be in rework
        task_resp = await client.get(f"/api/v1/tasks/{task_id}")
        assert task_resp.json()["status"] == "rework"

    async def test_review_approve_partial_keeps_task_open(
        self, client: AsyncClient
    ) -> None:
        """Approving one of two participants must NOT close the task.

        The task stays in progress until every participant has an approved
        submission.
        """
        ct, _ = await register_company(client, "multi@test.com")
        create = await client.post(
            "/api/v1/tasks",
            json={"title": "Multi Task", "status": "open", "participant_limit": 2},
            headers={"Authorization": f"Bearer {ct}"},
        )
        task_id = create.json()["id"]

        tokens: list[str] = []
        for i in (1, 2):
            pt, _ = await register_participant(client, f"multip{i}@test.com")
            await client.patch(
                "/api/v1/participants/me",
                json={"first_name": f"Парт{i}", "last_name": "Мульти"},
                headers={"Authorization": f"Bearer {pt}"},
            )
            app_resp = await client.post(
                "/api/v1/applications",
                json={"task_id": task_id},
                headers={"Authorization": f"Bearer {pt}"},
            )
            app_id = app_resp.json()["id"]
            await client.patch(
                f"/api/v1/applications/{app_id}/status",
                json={"status": "approved"},
                headers={"Authorization": f"Bearer {ct}"},
            )
            tokens.append(pt)

        await client.patch(
            f"/api/v1/tasks/{task_id}/status",
            json={"status": "in_progress"},
            headers={"Authorization": f"Bearer {ct}"},
        )

        # First participant submits and is approved
        sub_resp = await client.post(
            f"/api/v1/tasks/{task_id}/submit",
            json={"description": "First result"},
            headers={"Authorization": f"Bearer {tokens[0]}"},
        )
        assert sub_resp.status_code == 201
        sub_id = sub_resp.json()["id"]
        review_resp = await client.patch(
            f"/api/v1/tasks/{task_id}/submissions/{sub_id}/review",
            json={"status": "approved", "review_comment": "Great"},
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert review_resp.status_code == 200

        # Task stays in progress — the second participant hasn't submitted
        task_resp = await client.get(f"/api/v1/tasks/{task_id}")
        assert task_resp.json()["status"] == "in_progress"

        # First participant completed, second still active
        parts = await client.get(
            f"/api/v1/tasks/{task_id}/participants",
            headers={"Authorization": f"Bearer {ct}"},
        )
        statuses = {p["status"] for p in parts.json()}
        assert statuses == {"active", "completed"}

        # Second participant submits and is approved → task completed
        sub_resp2 = await client.post(
            f"/api/v1/tasks/{task_id}/submit",
            json={"description": "Second result"},
            headers={"Authorization": f"Bearer {tokens[1]}"},
        )
        assert sub_resp2.status_code == 201
        sub_id2 = sub_resp2.json()["id"]
        review_resp2 = await client.patch(
            f"/api/v1/tasks/{task_id}/submissions/{sub_id2}/review",
            json={"status": "approved", "review_comment": "Also great"},
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert review_resp2.status_code == 200

        task_resp2 = await client.get(f"/api/v1/tasks/{task_id}")
        assert task_resp2.json()["status"] == "completed"


# ── Directory info in task responses ──


class TestTaskDirectoryInfo:
    async def test_task_response_has_company_name(
        self, client: AsyncClient
    ) -> None:
        token, _ = await register_company(client, "dircomp@test.com")
        create = await client.post(
            "/api/v1/tasks",
            json={"title": "Dir Test", "status": "open"},
            headers={"Authorization": f"Bearer {token}"},
        )
        task_id = create.json()["id"]

        resp = await client.get(f"/api/v1/tasks/{task_id}")
        assert resp.json()["company_name"] is not None

    async def test_task_list_item_has_company_name(
        self, client: AsyncClient
    ) -> None:
        token, _ = await register_company(client, "listdir@test.com")
        await client.post(
            "/api/v1/tasks",
            json={"title": "List Dir Test", "status": "open"},
            headers={"Authorization": f"Bearer {token}"},
        )

        resp = await client.get("/api/v1/tasks")
        for task in resp.json():
            assert "company_name" in task


class TestTaskParticipants:
    async def _setup_active(
        self, client: AsyncClient, email: str
    ) -> tuple[str, str, int]:
        """Create task with one approved application → active participation."""
        ct, _ = await register_company(client, email)
        create = await client.post(
            "/api/v1/tasks",
            json={"title": "Parts Task", "status": "open", "participant_limit": 1},
            headers={"Authorization": f"Bearer {ct}"},
        )
        task_id = create.json()["id"]

        pt, _ = await register_participant(client, f"p-{email}")
        await client.patch(
            "/api/v1/participants/me",
            json={"first_name": "Петя", "last_name": "Петров"},
            headers={"Authorization": f"Bearer {pt}"},
        )
        app_resp = await client.post(
            "/api/v1/applications",
            json={"task_id": task_id},
            headers={"Authorization": f"Bearer {pt}"},
        )
        app_id = app_resp.json()["id"]
        await client.patch(
            f"/api/v1/applications/{app_id}/status",
            json={"status": "approved"},
            headers={"Authorization": f"Bearer {ct}"},
        )
        return ct, pt, task_id

    async def test_participants_after_approval(
        self, client: AsyncClient
    ) -> None:
        """Approved application → participant visible with status active."""
        ct, _pt, task_id = await self._setup_active(
            client, "parts1@test.com"
        )
        resp = await client.get(
            f"/api/v1/tasks/{task_id}/participants",
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["status"] == "active"
        assert data[0]["participant_first_name"] == "Петя"

    async def test_participants_after_submission_approved(
        self, client: AsyncClient
    ) -> None:
        """Participant stays visible (status completed) after submission approved."""
        ct, pt, task_id = await self._setup_active(
            client, "parts2@test.com"
        )
        # Start work + submit + approve
        await client.patch(
            f"/api/v1/tasks/{task_id}/status",
            json={"status": "in_progress"},
            headers={"Authorization": f"Bearer {ct}"},
        )
        sub_resp = await client.post(
            f"/api/v1/tasks/{task_id}/submit",
            json={"description": "Done", "result_links": "https://example.com"},
            headers={"Authorization": f"Bearer {pt}"},
        )
        sub_id = sub_resp.json()["id"]
        await client.patch(
            f"/api/v1/tasks/{task_id}/submissions/{sub_id}/review",
            json={"status": "approved", "review_comment": "Great"},
            headers={"Authorization": f"Bearer {ct}"},
        )

        resp = await client.get(
            f"/api/v1/tasks/{task_id}/participants",
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["status"] == "completed"
        assert data[0]["participant_first_name"] == "Петя"

    async def test_participants_participant_forbidden(
        self, client: AsyncClient
    ) -> None:
        ct, pt, task_id = await self._setup_active(
            client, "parts3@test.com"
        )
        resp = await client.get(
            f"/api/v1/tasks/{task_id}/participants",
            headers={"Authorization": f"Bearer {pt}"},
        )
        assert resp.status_code == 403

    async def test_remove_participant(self, client: AsyncClient) -> None:
        """Removing a participant deletes participation, rejects the
        application and recomputes participant_count."""
        ct, _pt, task_id = await self._setup_active(
            client, "parts4@test.com"
        )
        resp = await client.delete(
            f"/api/v1/tasks/{task_id}/participants/1",
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 204

        # Participant gone from the list
        list_resp = await client.get(
            f"/api/v1/tasks/{task_id}/participants",
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert list_resp.status_code == 200
        assert list_resp.json() == []

        # Application rejected, count recomputed
        task_resp = await client.get(
            f"/api/v1/tasks/{task_id}",
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert task_resp.json()["participant_count"] == 0

    async def test_remove_participant_wrong_participant_id(
        self, client: AsyncClient
    ) -> None:
        ct, _pt, task_id = await self._setup_active(
            client, "parts5@test.com"
        )
        resp = await client.delete(
            f"/api/v1/tasks/{task_id}/participants/999",
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 404

    async def test_remove_participant_participant_forbidden(
        self, client: AsyncClient
    ) -> None:
        ct, pt, task_id = await self._setup_active(
            client, "parts6@test.com"
        )
        resp = await client.delete(
            f"/api/v1/tasks/{task_id}/participants/1",
            headers={"Authorization": f"Bearer {pt}"},
        )
        assert resp.status_code == 403

    async def test_remove_participant_wrong_company(
        self, client: AsyncClient
    ) -> None:
        """Another company cannot remove a participant from a foreign task."""
        ct, _pt, task_id = await self._setup_active(
            client, "parts7@test.com"
        )
        ct2, _ = await register_company(client, "parts7b@test.com")
        resp = await client.delete(
            f"/api/v1/tasks/{task_id}/participants/1",
            headers={"Authorization": f"Bearer {ct2}"},
        )
        assert resp.status_code == 404

    async def test_update_participant_status(self, client: AsyncClient) -> None:
        """Owner can flip participant status active -> completed."""
        ct, _pt, task_id = await self._setup_active(
            client, "parts8@test.com"
        )
        resp = await client.patch(
            f"/api/v1/tasks/{task_id}/participants/1/status",
            json={"status": "completed"},
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "completed"
        assert data["participant_first_name"] == "Петя"
        assert data["participant_last_name"] == "Петров"

    async def test_update_participant_status_invalid(
        self, client: AsyncClient
    ) -> None:
        ct, _pt, task_id = await self._setup_active(
            client, "parts9@test.com"
        )
        resp = await client.patch(
            f"/api/v1/tasks/{task_id}/participants/1/status",
            json={"status": "fired"},
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 422

    async def test_approve_without_submission(
        self, client: AsyncClient
    ) -> None:
        """Company can approve a participant who never submitted and leave a review."""
        ct, _pt, task_id = await self._setup_active(
            client, "parts10@test.com"
        )
        resp = await client.post(
            f"/api/v1/tasks/{task_id}/participants/1/approve",
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 200
        sub = resp.json()
        assert sub["status"] == "approved"
        assert sub["participant_first_name"] == "Петя"

        # Participation is completed
        parts = await client.get(
            f"/api/v1/tasks/{task_id}/participants",
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert parts.json()[0]["status"] == "completed"

        # Review can be left right away
        review_resp = await client.post(
            f"/api/v1/tasks/{task_id}/submissions/{sub['id']}/review",
            json={"rating": 5, "text": "Accepted without result"},
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert review_resp.status_code == 201

    async def test_approve_without_submission_partial(
        self, client: AsyncClient
    ) -> None:
        """Approving one of two participants without result keeps the task open."""
        ct, _ = await register_company(client, "parts10b@test.com")
        create = await client.post(
            "/api/v1/tasks",
            json={"title": "Parts Task 10b", "status": "open", "participant_limit": 2},
            headers={"Authorization": f"Bearer {ct}"},
        )
        task_id = create.json()["id"]

        for i in (1, 2):
            pt, _ = await register_participant(client, f"parts10b{i}@test.com")
            await client.patch(
                "/api/v1/participants/me",
                json={"first_name": f"Уч{i}", "last_name": "Тест"},
                headers={"Authorization": f"Bearer {pt}"},
            )
            app_resp = await client.post(
                "/api/v1/applications",
                json={"task_id": task_id},
                headers={"Authorization": f"Bearer {pt}"},
            )
            await client.patch(
                f"/api/v1/applications/{app_resp.json()['id']}/status",
                json={"status": "approved"},
                headers={"Authorization": f"Bearer {ct}"},
            )

        await client.patch(
            f"/api/v1/tasks/{task_id}/status",
            json={"status": "in_progress"},
            headers={"Authorization": f"Bearer {ct}"},
        )

        resp = await client.post(
            f"/api/v1/tasks/{task_id}/participants/1/approve",
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 200

        # Task stays in progress — participant 2 still hasn't anything
        task_resp = await client.get(f"/api/v1/tasks/{task_id}")
        assert task_resp.json()["status"] == "in_progress"

        # Second participant approved too → task completed
        resp2 = await client.post(
            f"/api/v1/tasks/{task_id}/participants/2/approve",
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp2.status_code == 200
        task_resp2 = await client.get(f"/api/v1/tasks/{task_id}")
        assert task_resp2.json()["status"] == "completed"

    async def test_approve_without_submission_existing_submission(
        self, client: AsyncClient
    ) -> None:
        """Cannot approve without result when the participant already submitted."""
        ct, _pt, task_id = await self._setup_active(
            client, "parts11@test.com"
        )
        await client.patch(
            f"/api/v1/tasks/{task_id}/status",
            json={"status": "in_progress"},
            headers={"Authorization": f"Bearer {ct}"},
        )
        pt2, _ = await register_participant(client, "parts11p@test.com")
        await client.patch(
            "/api/v1/participants/me",
            json={"first_name": "Петя", "last_name": "Петров"},
            headers={"Authorization": f"Bearer {pt2}"},
        )
        app_resp = await client.post(
            "/api/v1/applications",
            json={"task_id": task_id},
            headers={"Authorization": f"Bearer {pt2}"},
        )
        await client.patch(
            f"/api/v1/applications/{app_resp.json()['id']}/status",
            json={"status": "approved"},
            headers={"Authorization": f"Bearer {ct}"},
        )
        await client.post(
            f"/api/v1/tasks/{task_id}/submit",
            json={"description": "Real result"},
            headers={"Authorization": f"Bearer {pt2}"},
        )

        resp = await client.post(
            f"/api/v1/tasks/{task_id}/participants/2/approve",
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 400

    async def test_approve_without_submission_participant_forbidden(
        self, client: AsyncClient
    ) -> None:
        ct, pt, task_id = await self._setup_active(
            client, "parts12@test.com"
        )
        resp = await client.post(
            f"/api/v1/tasks/{task_id}/participants/1/approve",
            headers={"Authorization": f"Bearer {pt}"},
        )
        assert resp.status_code == 403

    async def test_approve_without_submission_wrong_company(
        self, client: AsyncClient
    ) -> None:
        ct, _pt, task_id = await self._setup_active(
            client, "parts13@test.com"
        )
        ct2, _ = await register_company(client, "parts13b@test.com")
        resp = await client.post(
            f"/api/v1/tasks/{task_id}/participants/1/approve",
            headers={"Authorization": f"Bearer {ct2}"},
        )
        assert resp.status_code == 404
