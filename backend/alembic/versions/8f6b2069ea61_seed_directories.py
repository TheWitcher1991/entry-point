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
    op.execute(
        """
        INSERT INTO categories (name, direction, is_active)
        VALUES
            ('Web Development', 'frontend', 1),
            ('Web Development', 'backend', 1),
            ('Mobile Development', 'mobile', 1),
            ('Data Science', 'data', 1),
            ('DevOps', 'devops', 1),
            ('Design', 'design', 1),
            ('QA', 'qa', 1),
            ('Management', 'management', 1)
        """
    )

    # ── Skills ──
    op.execute(
        """
        INSERT INTO skills (name, category_id, is_active)
        VALUES
            -- Web / Frontend (cat 1)
            ('HTML', 1, 1),
            ('CSS', 1, 1),
            ('JavaScript', 1, 1),
            ('TypeScript', 1, 1),
            ('React', 1, 1),
            ('Vue.js', 1, 1),
            ('Angular', 1, 1),
            ('Next.js', 1, 1),
            ('Svelte', 1, 1),
            ('Tailwind CSS', 1, 1),
            -- Web / Backend (cat 2)
            ('Python', 2, 1),
            ('Django', 2, 1),
            ('FastAPI', 2, 1),
            ('Flask', 2, 1),
            ('Node.js', 2, 1),
            ('Express', 2, 1),
            ('Go', 2, 1),
            ('Rust', 2, 1),
            ('PostgreSQL', 2, 1),
            ('MongoDB', 2, 1),
            ('GraphQL', 2, 1),
            ('Redis', 2, 1),
            ('RabbitMQ', 2, 1),
            -- Mobile (cat 3)
            ('Swift', 3, 1),
            ('Kotlin', 3, 1),
            ('React Native', 3, 1),
            ('Flutter', 3, 1),
            ('iOS Development', 3, 1),
            ('Android Development', 3, 1),
            -- Data Science (cat 4)
            ('SQL', 4, 1),
            ('Python for Data', 4, 1),
            ('Machine Learning', 4, 1),
            ('Deep Learning', 4, 1),
            ('TensorFlow', 4, 1),
            ('PyTorch', 4, 1),
            ('Data Engineering', 4, 1),
            ('Tableau', 4, 1),
            -- DevOps (cat 5)
            ('Docker', 5, 1),
            ('Kubernetes', 5, 1),
            ('CI/CD', 5, 1),
            ('AWS', 5, 1),
            ('GCP', 5, 1),
            ('Azure', 5, 1),
            ('Terraform', 5, 1),
            ('Ansible', 5, 1),
            ('Linux', 5, 1),
            -- Design (cat 6)
            ('Figma', 6, 1),
            ('UI Design', 6, 1),
            ('UX Research', 6, 1),
            ('Design Systems', 6, 1),
            ('Prototyping', 6, 1),
            ('User Testing', 6, 1),
            ('Motion Design', 6, 1),
            -- QA (cat 7)
            ('Manual Testing', 7, 1),
            ('Automation Testing', 7, 1),
            ('Selenium', 7, 1),
            ('Performance Testing', 7, 1),
            ('API Testing', 7, 1),
            ('Cypress', 7, 1),
            -- Management (cat 8)
            ('Project Management', 8, 1),
            ('Agile', 8, 1),
            ('Scrum', 8, 1),
            ('Team Leadership', 8, 1),
            ('Product Management', 8, 1),
            ('Technical Writing', 8, 1)
        """
    )


def downgrade() -> None:
    op.execute("DELETE FROM skills")
    op.execute("DELETE FROM categories")
