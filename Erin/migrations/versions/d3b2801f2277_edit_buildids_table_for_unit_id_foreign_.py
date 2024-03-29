"""Edit BuildIDs table for unit_id foreign key instead of 2d code

Revision ID: d3b2801f2277
Revises: d5ea0440db24
Create Date: 2023-07-24 16:50:57.704419

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "d3b2801f2277"
down_revision = "d5ea0440db24"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("build_ids", schema=None) as batch_op:
        batch_op.add_column(sa.Column("unit_id", sa.Integer(), nullable=True))
        batch_op.drop_constraint("_unique_build_ids", type_="unique")
        batch_op.create_unique_constraint(
            "_unique_build_ids",
            [
                "time_stamp",
                "voltage_id",
                "temperature_id",
                "unit_id",
                "test_id",
                "project_id",
            ],
        )
        batch_op.create_foreign_key(
            "fk_build_ids_unit_id_units", "units", ["unit_id"], ["id"]
        )
        batch_op.drop_column("two_d_name")

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("build_ids", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("two_d_name", sa.VARCHAR(length=255), nullable=True)
        )
        batch_op.drop_constraint(None, type_="foreignkey")
        batch_op.drop_constraint("_unique_build_ids", type_="unique")
        batch_op.create_unique_constraint(
            "_unique_build_ids",
            [
                "time_stamp",
                "voltage_id",
                "temperature_id",
                "two_d_name",
                "test_id",
                "project_id",
            ],
        )
        batch_op.drop_column("unit_id")

    # ### end Alembic commands ###
