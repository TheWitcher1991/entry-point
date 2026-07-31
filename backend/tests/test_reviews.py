"""Tests for reviews — create, list by company, list by participant, guard checks."""

from httpx import AsyncClient

from tests.helpers import register_company, register_participant


async def _setup_approved_submission(
    client: AsyncClient,
) -> tuple[str, str, int, int]:
    """Create a task with an approved submission + review, return (ct, pt, task_id, sub_id)."""
    ct, _ = await register_company(client, "revcomp@test.com")
    create = await client.post(
        "/api/v1/tasks",
        json={"title": "Review Task", "status": "open", "participant_limit": 1},
        headers={"Authorization": f"Bearer {ct}"},
    )
    task_id = create.json()["id"]

    pt, _ = await register_participant(client, "revpart@test.com")
    await client.get(
        "/api/v1/participants/me",
        headers={"Authorization": f"Bearer {pt}"},
    )
    await client.patch(
        "/api/v1/participants/me",
        json={"first_name": "Review", "last_name": "Tester"},
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

    # Set to in_progress
    await client.patch(
        f"/api/v1/tasks/{task_id}/status",
        json={"status": "in_progress"},
        headers={"Authorization": f"Bearer {ct}"},
    )

    # Submit + approve
    sub_resp = await client.post(
        f"/api/v1/tasks/{task_id}/submit",
        json={"description": "Done", "result_links": "https://github.com/test"},
        headers={"Authorization": f"Bearer {pt}"},
    )
    sub_id = sub_resp.json()["id"]

    await client.patch(
        f"/api/v1/tasks/{task_id}/submissions/{sub_id}/review",
        json={"status": "approved", "review_comment": "Great!"},
        headers={"Authorization": f"Bearer {ct}"},
    )

    return ct, pt, task_id, sub_id


class TestCreateReview:
    async def test_create_review_success(self, client: AsyncClient) -> None:
        """Create a review for an approved submission."""
        ct, pt, task_id, sub_id = await _setup_approved_submission(client)

        resp = await client.post(
            f"/api/v1/tasks/{task_id}/submissions/{sub_id}/review",
            json={
                "rating": 5,
                "text": "Excellent work!",
                "skills_confirmed": "Python, FastAPI, PostgreSQL",
            },
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["rating"] == 5
        assert data["text"] == "Excellent work!"
        assert data["skills_confirmed"] == "Python, FastAPI, PostgreSQL"
        assert data["company_name"] == "Company revcomp@test.com"

    async def test_create_review_unauthenticated(
        self, client: AsyncClient
    ) -> None:
        ct, pt, task_id, sub_id = await _setup_approved_submission(client)
        resp = await client.post(
            f"/api/v1/tasks/{task_id}/submissions/{sub_id}/review",
            json={"rating": 4, "text": "Good"},
        )
        assert resp.status_code == 401

    async def test_create_review_participant_forbidden(
        self, client: AsyncClient
    ) -> None:
        ct, pt, task_id, sub_id = await _setup_approved_submission(client)
        resp = await client.post(
            f"/api/v1/tasks/{task_id}/submissions/{sub_id}/review",
            json={"rating": 4, "text": "Good"},
            headers={"Authorization": f"Bearer {pt}"},
        )
        assert resp.status_code == 403

    async def test_create_review_duplicate(self, client: AsyncClient) -> None:
        """Cannot create two reviews for the same submission."""
        ct, pt, task_id, sub_id = await _setup_approved_submission(client)
        # Create first review
        await client.post(
            f"/api/v1/tasks/{task_id}/submissions/{sub_id}/review",
            json={"rating": 5, "text": "Great"},
            headers={"Authorization": f"Bearer {ct}"},
        )
        # Try duplicate
        resp = await client.post(
            f"/api/v1/tasks/{task_id}/submissions/{sub_id}/review",
            json={"rating": 3, "text": "Second"},
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 409

    async def test_create_review_wrong_company(self, client: AsyncClient) -> None:
        """Other company cannot review."""
        ct, pt, task_id, sub_id = await _setup_approved_submission(client)
        ct2, _ = await register_company(client, "othercomp@test.com")
        resp = await client.post(
            f"/api/v1/tasks/{task_id}/submissions/{sub_id}/review",
            json={"rating": 4, "text": "Nice"},
            headers={"Authorization": f"Bearer {ct2}"},
        )
        assert resp.status_code == 403


class TestListReviews:
    async def test_list_company_reviews(self, client: AsyncClient) -> None:
        ct, pt, task_id, sub_id = await _setup_approved_submission(client)
        await client.post(
            f"/api/v1/tasks/{task_id}/submissions/{sub_id}/review",
            json={"rating": 5, "text": "Superb"},
            headers={"Authorization": f"Bearer {ct}"},
        )

        # Get company ID from the task response
        task_resp = await client.get(f"/api/v1/tasks/{task_id}")
        company_id = task_resp.json()["company_id"]

        resp = await client.get(f"/api/v1/companies/{company_id}/reviews")
        assert resp.status_code == 200
        reviews = resp.json()
        assert len(reviews) == 1
        assert reviews[0]["rating"] == 5

    async def test_list_my_reviews(self, client: AsyncClient) -> None:
        ct, pt, task_id, sub_id = await _setup_approved_submission(client)
        await client.post(
            f"/api/v1/tasks/{task_id}/submissions/{sub_id}/review",
            json={"rating": 4, "text": "Good job"},
            headers={"Authorization": f"Bearer {ct}"},
        )

        resp = await client.get(
            "/api/v1/participants/me/reviews",
            headers={"Authorization": f"Bearer {pt}"},
        )
        assert resp.status_code == 200
        reviews = resp.json()
        assert len(reviews) >= 1
        # Should have company_name and task_title
        assert reviews[0]["company_name"] is not None
        assert reviews[0]["task_title"] is not None


class TestListTaskReviews:
    async def test_list_task_reviews(self, client: AsyncClient) -> None:
        ct, pt, task_id, sub_id = await _setup_approved_submission(client)
        await client.post(
            f"/api/v1/tasks/{task_id}/submissions/{sub_id}/review",
            json={"rating": 5, "text": "Superb"},
            headers={"Authorization": f"Bearer {ct}"},
        )

        resp = await client.get(
            f"/api/v1/tasks/{task_id}/reviews",
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 200
        reviews = resp.json()
        assert len(reviews) == 1
        assert reviews[0]["rating"] == 5
        assert reviews[0]["participant_first_name"] == "Review"
        assert reviews[0]["participant_last_name"] == "Tester"

    async def test_list_task_reviews_participant_forbidden(
        self, client: AsyncClient
    ) -> None:
        ct, pt, task_id, sub_id = await _setup_approved_submission(client)
        resp = await client.get(
            f"/api/v1/tasks/{task_id}/reviews",
            headers={"Authorization": f"Bearer {pt}"},
        )
        assert resp.status_code == 403

    async def test_list_task_reviews_foreign_task_not_found(
        self, client: AsyncClient
    ) -> None:
        ct, pt, task_id, sub_id = await _setup_approved_submission(client)
        ct2, _ = await register_company(client, "other2@test.com")
        resp = await client.get(
            f"/api/v1/tasks/{task_id}/reviews",
            headers={"Authorization": f"Bearer {ct2}"},
        )
        assert resp.status_code == 404

    async def test_list_task_reviews_empty(self, client: AsyncClient) -> None:
        ct, _ = await register_company(client, "revcomp2@test.com")
        create = await client.post(
            "/api/v1/tasks",
            json={"title": "Empty Task", "status": "open", "participant_limit": 1},
            headers={"Authorization": f"Bearer {ct}"},
        )
        task_id = create.json()["id"]

        resp = await client.get(
            f"/api/v1/tasks/{task_id}/reviews",
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 200
        assert resp.json() == []


class TestReviewValidations:
    async def test_review_invalid_rating_below(
        self, client: AsyncClient
    ) -> None:
        ct, pt, task_id, sub_id = await _setup_approved_submission(client)
        resp = await client.post(
            f"/api/v1/tasks/{task_id}/submissions/{sub_id}/review",
            json={"rating": 0, "text": "Bad"},
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 422

    async def test_review_invalid_rating_above(
        self, client: AsyncClient
    ) -> None:
        ct, pt, task_id, sub_id = await _setup_approved_submission(client)
        resp = await client.post(
            f"/api/v1/tasks/{task_id}/submissions/{sub_id}/review",
            json={"rating": 6, "text": "Too high"},
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 422


class TestManageReview:
    async def _create_review(
        self, client: AsyncClient, ct: str, task_id: int, sub_id: int
    ) -> int:
        resp = await client.post(
            f"/api/v1/tasks/{task_id}/submissions/{sub_id}/review",
            json={
                "rating": 5,
                "text": "Excellent work!",
                "skills_confirmed": "Python, FastAPI",
            },
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 201
        return resp.json()["id"]

    async def test_update_review(self, client: AsyncClient) -> None:
        """Company can edit the review content."""
        ct, pt, task_id, sub_id = await _setup_approved_submission(client)
        review_id = await self._create_review(client, ct, task_id, sub_id)

        resp = await client.patch(
            f"/api/v1/tasks/{task_id}/reviews/{review_id}",
            json={
                "rating": 3,
                "text": "Edited text",
                "skills_confirmed": "PostgreSQL",
            },
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["rating"] == 3
        assert data["text"] == "Edited text"
        assert data["skills_confirmed"] == "PostgreSQL"

        # List reflects the update
        list_resp = await client.get(
            f"/api/v1/tasks/{task_id}/reviews",
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert list_resp.json()[0]["rating"] == 3
        assert list_resp.json()[0]["text"] == "Edited text"

    async def test_update_review_wrong_company(
        self, client: AsyncClient
    ) -> None:
        ct, pt, task_id, sub_id = await _setup_approved_submission(client)
        review_id = await self._create_review(client, ct, task_id, sub_id)

        ct2, _ = await register_company(client, "revcomp2@test.com")
        resp = await client.patch(
            f"/api/v1/tasks/{task_id}/reviews/{review_id}",
            json={"rating": 2, "text": "Hijack"},
            headers={"Authorization": f"Bearer {ct2}"},
        )
        assert resp.status_code == 404

    async def test_update_review_participant_forbidden(
        self, client: AsyncClient
    ) -> None:
        ct, pt, task_id, sub_id = await _setup_approved_submission(client)
        review_id = await self._create_review(client, ct, task_id, sub_id)

        resp = await client.patch(
            f"/api/v1/tasks/{task_id}/reviews/{review_id}",
            json={"rating": 4, "text": "Nope"},
            headers={"Authorization": f"Bearer {pt}"},
        )
        assert resp.status_code == 403

    async def test_update_review_not_found(self, client: AsyncClient) -> None:
        ct, pt, task_id, sub_id = await _setup_approved_submission(client)
        resp = await client.patch(
            f"/api/v1/tasks/{task_id}/reviews/999",
            json={"rating": 4, "text": "Nope"},
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 404

    async def test_delete_review(self, client: AsyncClient) -> None:
        """Deleting a review removes it and allows creating a new one."""
        ct, pt, task_id, sub_id = await _setup_approved_submission(client)
        review_id = await self._create_review(client, ct, task_id, sub_id)

        resp = await client.delete(
            f"/api/v1/tasks/{task_id}/reviews/{review_id}",
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert resp.status_code == 204

        # No reviews left
        list_resp = await client.get(
            f"/api/v1/tasks/{task_id}/reviews",
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert list_resp.json() == []

        # A new review can be created again
        new_resp = await client.post(
            f"/api/v1/tasks/{task_id}/submissions/{sub_id}/review",
            json={"rating": 4, "text": "Second chance"},
            headers={"Authorization": f"Bearer {ct}"},
        )
        assert new_resp.status_code == 201

    async def test_delete_review_wrong_company(
        self, client: AsyncClient
    ) -> None:
        ct, pt, task_id, sub_id = await _setup_approved_submission(client)
        review_id = await self._create_review(client, ct, task_id, sub_id)

        ct2, _ = await register_company(client, "revcomp3@test.com")
        resp = await client.delete(
            f"/api/v1/tasks/{task_id}/reviews/{review_id}",
            headers={"Authorization": f"Bearer {ct2}"},
        )
        assert resp.status_code == 404

    async def test_delete_review_participant_forbidden(
        self, client: AsyncClient
    ) -> None:
        ct, pt, task_id, sub_id = await _setup_approved_submission(client)
        review_id = await self._create_review(client, ct, task_id, sub_id)

        resp = await client.delete(
            f"/api/v1/tasks/{task_id}/reviews/{review_id}",
            headers={"Authorization": f"Bearer {pt}"},
        )
        assert resp.status_code == 403
