"""seed directories

Revision ID: 8f6b2069ea61
Revises: 1e239d24af4f
Create Date: 2026-07-29 17:01:59.857726
"""

from collections.abc import Sequence

from alembic import op

revision: str = "8f6b2069ea61"
down_revision: str | None = "1e239d24af4f"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # ── Categories ──
    # is_active is BOOLEAN in PostgreSQL, use TRUE not 1
    op.execute(
        """
        INSERT INTO categories (name, direction, is_active)
        VALUES
            ('Web Development', 'frontend', TRUE),
            ('Web Development', 'backend', TRUE),
            ('Mobile Development', 'mobile', TRUE),
            ('Data Science', 'data', TRUE),
            ('DevOps', 'devops', TRUE),
            ('Design', 'design', TRUE),
            ('QA', 'qa', TRUE),
            ('Management', 'management', TRUE)
        """
    )

    # ── Skills ──
    op.execute(
        """
        INSERT INTO skills (name, category_id, is_active)
        VALUES
            -- Web / Frontend (cat 1)
            ('HTML', 1, TRUE),
            ('CSS', 1, TRUE),
            ('JavaScript', 1, TRUE),
            ('TypeScript', 1, TRUE),
            ('React', 1, TRUE),
            ('Vue.js', 1, TRUE),
            ('Angular', 1, TRUE),
            ('Next.js', 1, TRUE),
            ('Svelte', 1, TRUE),
            ('Tailwind CSS', 1, TRUE),
            -- Web / Backend (cat 2)
            ('Python', 2, TRUE),
            ('Django', 2, TRUE),
            ('FastAPI', 2, TRUE),
            ('Flask', 2, TRUE),
            ('Node.js', 2, TRUE),
            ('Express', 2, TRUE),
            ('Go', 2, TRUE),
            ('Rust', 2, TRUE),
            ('PostgreSQL', 2, TRUE),
            ('MongoDB', 2, TRUE),
            ('GraphQL', 2, TRUE),
            ('Redis', 2, TRUE),
            ('RabbitMQ', 2, TRUE),
            -- Mobile (cat 3)
            ('Swift', 3, TRUE),
            ('Kotlin', 3, TRUE),
            ('React Native', 3, TRUE),
            ('Flutter', 3, TRUE),
            ('iOS Development', 3, TRUE),
            ('Android Development', 3, TRUE),
            -- Data Science (cat 4)
            ('SQL', 4, TRUE),
            ('Python for Data', 4, TRUE),
            ('Machine Learning', 4, TRUE),
            ('Deep Learning', 4, TRUE),
            ('TensorFlow', 4, TRUE),
            ('PyTorch', 4, TRUE),
            ('Data Engineering', 4, TRUE),
            ('Tableau', 4, TRUE),
            -- DevOps (cat 5)
            ('Docker', 5, TRUE),
            ('Kubernetes', 5, TRUE),
            ('CI/CD', 5, TRUE),
            ('AWS', 5, TRUE),
            ('GCP', 5, TRUE),
            ('Azure', 5, TRUE),
            ('Terraform', 5, TRUE),
            ('Ansible', 5, TRUE),
            ('Linux', 5, TRUE),
            -- Design (cat 6)
            ('Figma', 6, TRUE),
            ('UI Design', 6, TRUE),
            ('UX Research', 6, TRUE),
            ('Design Systems', 6, TRUE),
            ('Prototyping', 6, TRUE),
            ('User Testing', 6, TRUE),
            ('Motion Design', 6, TRUE),
            -- QA (cat 7)
            ('Manual Testing', 7, TRUE),
            ('Automation Testing', 7, TRUE),
            ('Selenium', 7, TRUE),
            ('Performance Testing', 7, TRUE),
            ('API Testing', 7, TRUE),
            ('Cypress', 7, TRUE),
            -- Management (cat 8)
            ('Project Management', 8, TRUE),
            ('Agile', 8, TRUE),
            ('Scrum', 8, TRUE),
            ('Team Leadership', 8, TRUE),
            ('Product Management', 8, TRUE),
            ('Technical Writing', 8, TRUE)
        """
    )


def downgrade() -> None:
    op.execute("DELETE FROM skills")
    op.execute("DELETE FROM categories")
