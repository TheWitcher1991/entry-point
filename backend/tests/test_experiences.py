"""Tests for VerifiedExperience — auto-creation on review, listing, public access."""

from httpx import AsyncClient

from tests.helpers import register_company, register_participant


async def _create_review(client: AsyncClient) -> tuple[str, str, int, int]:
    """Create a review and return (ct, pt, task_id, review_id)."""
    ct, _ = await register_company(client, "expcomp@test.com")
    create = await client.post(
        "/api/v1/tasks",
        json={"title": "Exp Task", "status": "open", "participant_limit": 1},
        headers={"Authorization": f"Bearer {ct}"},
    )
    task_id = create.json()["id"]

    pt, _ = await register_participant(client, "exppart@test.com")
    await client.get(
        "/api/v1/participants/me",
        headers={"Authorization": f"Bearer {pt}"},
    )
    await client.patch(
        "/api/v1/participants/me",
        json={"first_name": "Exp", "last_name": "Test"},
        headers={"Authorization": f"Bearer {pt}"},
    )

    # Apply + approve
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

    # in_progress
    await client.patch(
        f"/api/v1/tasks/{task_id}/status",
        json={"status": "in_progress"},
        headers={"Authorization": f"Bearer {ct}"},
    )

    # Submit + approve
    sub = await client.post(
        f"/api/v1/tasks/{task_id}/submit",
        json={"description": "Done"},
        headers={"Authorization": f"Bearer {pt}"},
    )
    sub_id = sub.json()["id"]

    await client.patch(
        f"/api/v1/tasks/{task_id}/submissions/{sub_id}/review",
        json={"status": "approved"},
        headers={"Authorization": f"Bearer {ct}"},
    )

    # Create review
    rev = await client.post(
        f"/api/v1/tasks/{task_id}/submissions/{sub_id}/review",
        json={
            "rating": 5,
            "text": "Amazing work!",
            "skills_confirmed": "Python, React, Docker",
        },
        headers={"Authorization": f"Bearer {ct}"},
    )
    review_id = rev.json()["id"]

    return ct, pt, task_id, review_id


class TestExperienceCreation:
    async def test_experience_created_on_review(
        self, client: AsyncClient
    ) -> None:
        """Review creation automatically creates VerifiedExperience."""
        ct, pt, task_id, review_id = await _create_review(client)

        # Verify experience exists
        resp = await client.get(
            "/api/v1/participants/me/experiences",
            headers={"Authorization": f"Bearer {pt}"},
        )
        assert resp.status_code == 200
        exps = resp.json()
        assert len(exps) >= 1
        exp = exps[0]
        assert exp["task_title"] == "Exp Task"
        assert exp["rating"] == 5
        assert exp["review_text"] == "Amazing work!"
        assert len(exp["skills"]) == 3
        skill_names = {s["skill_name"] for s in exp["skills"]}
        assert "Python" in skill_names
        assert "React" in skill_names
        assert "Docker" in skill_names

    async def test_experience_has_company_name(
        self, client: AsyncClient
    ) -> None:
        ct, pt, task_id, review_id = await _create_review(client)
        resp = await client.get(
            "/api/v1/participants/me/experiences",
            headers={"Authorization": f"Bearer {pt}"},
        )
        assert resp.json()[0]["company_name"] is not None


class TestListExperiences:
    async def test_public_experiences(self, client: AsyncClient) -> None:
        ct, pt, task_id, review_id = await _create_review(client)

        # Get participant profile to find participant_id
        prof_resp = await client.get(
            "/api/v1/participants/me",
            headers={"Authorization": f"Bearer {pt}"},
        )
        participant_id = prof_resp.json()["id"]

        resp = await client.get(
            f"/api/v1/participants/{participant_id}/experiences"
        )
        assert resp.status_code == 200
        exps = resp.json()
        assert len(exps) >= 1
        assert exps[0]["task_title"] == "Exp Task"

    async def test_get_single_experience(self, client: AsyncClient) -> None:
        ct, pt, task_id, review_id = await _create_review(client)

        # Get experiences
        resp = await client.get(
            "/api/v1/participants/me/experiences",
            headers={"Authorization": f"Bearer {pt}"},
        )
        exp_id = resp.json()[0]["id"]

        # Get single
        resp = await client.get(f"/api/v1/experiences/{exp_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == exp_id
        assert data["review_id"] == review_id

    async def test_experience_not_found(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/experiences/99999")
        assert resp.status_code == 404

    async def test_public_experiences_participant_not_found(
        self, client: AsyncClient
    ) -> None:
        resp = await client.get("/api/v1/participants/99999/experiences")
        assert resp.status_code == 404
