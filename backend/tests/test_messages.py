"""Tests for task messages — chat between company and participant.

Regression coverage for: conversation participants endpoint (async lazy-load
bug → 500) and per-participant message threads.
"""

from httpx import AsyncClient


async def _register_company(client: AsyncClient, email: str) -> str:
    """Register a company user, set a name, return the token."""
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "password123", "role": "company"},
    )
    assert resp.status_code == 201
    token = resp.json()["access_token"]
    await client.patch(
        "/api/v1/companies/me",
        json={"name": email},
        headers={"Authorization": f"Bearer {token}"},
    )
    return token


async def _register_participant(client: AsyncClient, email: str) -> str:
    """Register a participant, ensure profile exists, return the token."""
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "password123", "role": "participant"},
    )
    assert resp.status_code == 201
    token = resp.json()["access_token"]
    resp = await client.get(
        "/api/v1/participants/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    return token


async def _create_task(client: AsyncClient, token: str, **overrides) -> dict:
    payload = {
        "title": "Chat Test Task",
        "summary": "Testing messages",
        "status": "open",
        "participant_limit": 3,
        **overrides,
    }
    resp = await client.post(
        "/api/v1/tasks",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201, f"Task create failed: {resp.text}"
    return resp.json()


async def _approve_participant(
    client: AsyncClient, company_token: str, task_id: int, participant_token: str
) -> None:
    """Apply to the task as participant and approve by company (→ participation)."""
    resp = await client.post(
        "/api/v1/applications",
        json={"task_id": task_id},
        headers={"Authorization": f"Bearer {participant_token}"},
    )
    assert resp.status_code == 201, f"Apply failed: {resp.text}"
    app_id = resp.json()["id"]
    resp = await client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "approved"},
        headers={"Authorization": f"Bearer {company_token}"},
    )
    assert resp.status_code == 200, f"Approve failed: {resp.text}"


# ── Conversation participants ──


class TestConversationParticipants:
    async def test_company_lists_participants(self, client: AsyncClient) -> None:
        """Regression: previously crashed with MissingGreenlet (lazy load in async)."""
        ct = await _register_company(client, "chat-comp-list@test.com")
        pt = await _register_participant(client, "chat-part-list@test.com")
        task = await _create_task(client, ct)
        await _approve_participant(client, ct, task["id"], pt)

        resp = await client.get(
            f"/api/v1/tasks/{task['id']}/messages/participants",
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 200, f"Participants failed: {resp.text}"
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] > 0
        assert isinstance(data[0]["first_name"], str)

    async def test_participant_cannot_list(self, client: AsyncClient) -> None:
        ct = await _register_company(client, "chat-comp-pl@test.com")
        pt = await _register_participant(client, "chat-part-pl@test.com")
        task = await _create_task(client, ct)
        await _approve_participant(client, ct, task["id"], pt)

        resp = await client.get(
            f"/api/v1/tasks/{task['id']}/messages/participants",
            headers={"Authorization": f"Bearer {pt}"},
        )
        assert resp.status_code == 403

    async def test_company_cannot_list_foreign_task(
        self, client: AsyncClient
    ) -> None:
        ct = await _register_company(client, "chat-comp-own@test.com")
        task = await _create_task(client, ct)
        ct2 = await _register_company(client, "chat-comp-foreign@test.com")

        resp = await client.get(
            f"/api/v1/tasks/{task['id']}/messages/participants",
            headers={"Authorization": f"Bearer {ct2}"},
        )
        assert resp.status_code == 403

    async def test_unauthenticated_cannot_list(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/tasks/1/messages/participants")
        assert resp.status_code == 401


# ── Sending messages ──


class TestSendMessage:
    async def _setup(self, client: AsyncClient) -> tuple[str, str, dict, str]:
        ct = await _register_company(client, "chat-comp-send@test.com")
        pt = await _register_participant(client, "chat-part-send@test.com")
        task = await _create_task(client, ct)
        await _approve_participant(client, ct, task["id"], pt)
        return ct, pt, task, pt

    async def test_company_requires_participant_id(
        self, client: AsyncClient
    ) -> None:
        ct, pt, task, _ = await self._setup(client)
        resp = await client.post(
            f"/api/v1/tasks/{task['id']}/messages",
            json={"text": "Hello"},
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 400
        assert "participant_profile_id" in resp.json()["detail"]

    async def test_company_send_success(self, client: AsyncClient) -> None:
        ct, pt, task, _ = await self._setup(client)
        # participant_profile_id of the approved participant
        me = await client.get(
            "/api/v1/participants/me",
            headers={"Authorization": f"Bearer {pt}"},
        )
        pid = me.json()["id"]

        resp = await client.post(
            f"/api/v1/tasks/{task['id']}/messages",
            json={"text": "Добро пожаловать!", "participant_profile_id": pid},
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 201, f"Send failed: {resp.text}"
        data = resp.json()
        assert data["text"] == "Добро пожаловать!"
        assert data["participant_profile_id"] == pid
        assert data["sender_role"] == "company"

    async def test_participant_send_success(self, client: AsyncClient) -> None:
        ct, pt, task, _ = await self._setup(client)
        resp = await client.post(
            f"/api/v1/tasks/{task['id']}/messages",
            json={"text": "Здравствуйте!"},
            headers={"Authorization": f"Bearer {pt}"},
        )
        assert resp.status_code == 201, f"Send failed: {resp.text}"
        data = resp.json()
        assert data["participant_profile_id"] is not None
        assert data["sender_role"] == "participant"

    async def test_company_send_to_non_participant_rejected(
        self, client: AsyncClient
    ) -> None:
        ct = await _register_company(client, "chat-comp-np@test.com")
        task = await _create_task(client, ct)
        pt = await _register_participant(client, "chat-part-np@test.com")
        # participant applied but NOT approved → not in task
        await client.post(
            "/api/v1/applications",
            json={"task_id": task["id"]},
            headers={"Authorization": f"Bearer {pt}"},
        )
        me = await client.get(
            "/api/v1/participants/me",
            headers={"Authorization": f"Bearer {pt}"},
        )
        pid = me.json()["id"]

        resp = await client.post(
            f"/api/v1/tasks/{task['id']}/messages",
            json={"text": "Hi", "participant_profile_id": pid},
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 400

    async def test_participant_not_in_task_forbidden(
        self, client: AsyncClient
    ) -> None:
        ct = await _register_company(client, "chat-comp-notpart@test.com")
        task = await _create_task(client, ct)
        pt = await _register_participant(client, "chat-part-notpart@test.com")

        resp = await client.post(
            f"/api/v1/tasks/{task['id']}/messages",
            json={"text": "Hello"},
            headers={"Authorization": f"Bearer {pt}"},
        )
        assert resp.status_code == 403

    async def test_company_cannot_send_foreign_task(
        self, client: AsyncClient
    ) -> None:
        ct = await _register_company(client, "chat-comp-sendown@test.com")
        task = await _create_task(client, ct)
        ct2 = await _register_company(client, "chat-comp-sendf@test.com")

        resp = await client.post(
            f"/api/v1/tasks/{task['id']}/messages",
            json={"text": "Hello", "participant_profile_id": 1},
            headers={"Authorization": f"Bearer {ct2}"},
        )
        assert resp.status_code == 403

    async def test_unauthenticated_cannot_send(self, client: AsyncClient) -> None:
        resp = await client.post(
            "/api/v1/tasks/1/messages", json={"text": "Hello"}
        )
        assert resp.status_code == 401


# ── Message threads ──


class TestMessageThreads:
    async def test_participant_sees_only_own_thread(
        self, client: AsyncClient
    ) -> None:
        ct = await _register_company(client, "chat-comp-thread@test.com")
        p1 = await _register_participant(client, "chat-part-t1@test.com")
        p2 = await _register_participant(client, "chat-part-t2@test.com")
        task = await _create_task(client, ct)
        await _approve_participant(client, ct, task["id"], p1)
        await _approve_participant(client, ct, task["id"], p2)

        me1 = await client.get(
            "/api/v1/participants/me",
            headers={"Authorization": f"Bearer {p1}"},
        )
        me2 = await client.get(
            "/api/v1/participants/me",
            headers={"Authorization": f"Bearer {p2}"},
        )
        pid1, pid2 = me1.json()["id"], me2.json()["id"]

        # Company sends to participant 1 only
        await client.post(
            f"/api/v1/tasks/{task['id']}/messages",
            json={"text": "Привет, участник 1", "participant_profile_id": pid1},
            headers={"Authorization": f"Bearer {ct}"},
        )
        # Participant 2 sends their own message
        await client.post(
            f"/api/v1/tasks/{task['id']}/messages",
            json={"text": "Привет, участник 2"},
            headers={"Authorization": f"Bearer {p2}"},
        )

        # Participant 1 sees only their thread (1 message from company)
        resp1 = await client.get(
            f"/api/v1/tasks/{task['id']}/messages",
            headers={"Authorization": f"Bearer {p1}"},
        )
        assert resp1.status_code == 200
        msgs1 = resp1.json()
        assert len(msgs1) == 1
        assert msgs1[0]["text"] == "Привет, участник 1"

        # Participant 2 sees only their own message
        resp2 = await client.get(
            f"/api/v1/tasks/{task['id']}/messages",
            headers={"Authorization": f"Bearer {p2}"},
        )
        assert len(resp2.json()) == 1
        assert resp2.json()[0]["text"] == "Привет, участник 2"

        # Company filters by participant 2 → only their thread
        resp_c = await client.get(
            f"/api/v1/tasks/{task['id']}/messages",
            params={"participant_profile_id": pid2},
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp_c.status_code == 200
        msgs_c = resp_c.json()
        assert len(msgs_c) == 1
        assert msgs_c[0]["text"] == "Привет, участник 2"

    async def test_empty_thread(self, client: AsyncClient) -> None:
        ct = await _register_company(client, "chat-comp-empty@test.com")
        task = await _create_task(client, ct)

        resp = await client.get(
            f"/api/v1/tasks/{task['id']}/messages",
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 200
        assert resp.json() == []
