"""Tests for notifications — create, list, mark as read, count unread."""

from httpx import AsyncClient

from tests.helpers import register_company, register_participant


class TestNotifications:
    async def _setup_data(self, client: AsyncClient) -> tuple[str, str, str]:
        """Create company, participant, task with approved application."""
        ct, _ = await register_company(client, "notifcomp@test.com")
        create = await client.post(
            "/api/v1/tasks",
            json={"title": "Notif Task", "status": "open", "participant_limit": 1},
            headers={"Authorization": f"Bearer {ct}"},
        )
        task_id = create.json()["id"]

        pt, _ = await register_participant(client, "notifpart@test.com")
        await client.get(
            "/api/v1/participants/me",
            headers={"Authorization": f"Bearer {pt}"},
        )

        # Apply
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

    async def test_notifications_empty(self, client: AsyncClient) -> None:
        """New participant has no notifications."""
        pt, _ = await register_participant(client, "empty@test.com")
        resp = await client.get(
            "/api/v1/notifications",
            headers={"Authorization": f"Bearer {pt}"},
        )
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_unauthenticated(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/notifications")
        assert resp.status_code == 401

    async def test_notifications_created_on_submit(
        self, client: AsyncClient
    ) -> None:
        """Submitting work creates notification for company."""
        ct, pt, task_id = await self._setup_data(client)

        # Set task to in_progress
        await client.patch(
            f"/api/v1/tasks/{task_id}/status",
            json={"status": "in_progress"},
            headers={"Authorization": f"Bearer {ct}"},
        )

        # Submit
        sub_resp = await client.post(
            f"/api/v1/tasks/{task_id}/submit",
            json={"description": "Done"},
            headers={"Authorization": f"Bearer {pt}"},
        )
        assert sub_resp.status_code == 201

        # Company should have a notification
        resp = await client.get(
            "/api/v1/notifications",
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 200
        notifs = resp.json()
        assert len(notifs) >= 1
        assert any("submission" in n.get("type", "").lower() for n in notifs)

    async def test_unread_count(self, client: AsyncClient) -> None:
        ct, pt, task_id = await self._setup_data(client)

        resp = await client.get(
            "/api/v1/notifications/unread-count",
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "count" in data

    async def test_mark_as_read(self, client: AsyncClient) -> None:
        ct, pt, task_id = await self._setup_data(client)

        # Get notifications
        resp = await client.get(
            "/api/v1/notifications",
            headers={"Authorization": f"Bearer {ct}"},
        )
        notifs = resp.json()
        if notifs:
            nid = notifs[0]["id"]
            mark_resp = await client.patch(
                f"/api/v1/notifications/{nid}/read",
                headers={"Authorization": f"Bearer {ct}"},
            )
            assert mark_resp.status_code == 200
