"""added test instance table in database

Revision ID: 5df82ee17f9c
Revises: 34fd8b114034
Create Date: 2023-07-25 13:20:16.280159

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5df82ee17f9c'
down_revision = '34fd8b114034'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('test_instances',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('project_id', sa.Integer(), nullable=False),
    sa.Column('voltage_id', sa.Integer(), nullable=False),
    sa.Column('temperature_id', sa.Integer(), nullable=False),
    sa.Column('test_id', sa.Integer(), nullable=False),
    sa.Column('s_suite', sa.String(length=255), nullable=False),
    sa.Column('suite', sa.String(length=255), nullable=False),
    sa.Column('test_name', sa.String(length=255), nullable=False),
    sa.Column('result', sa.String(length=255), nullable=True),
    sa.Column('max_temp', sa.Float(), nullable=True),
    sa.Column('min_temp', sa.Float(), nullable=True),
    sa.Column('run_time', sa.Integer(), nullable=True),
    sa.Column('vcc_int', sa.Float(), nullable=True),
    sa.Column('vcc_pmc', sa.Float(), nullable=True),
    sa.Column('vcc_psfp', sa.Float(), nullable=True),
    sa.Column('vcc_ram', sa.Float(), nullable=True),
    sa.Column('vcc_soc', sa.Float(), nullable=True),
    sa.Column('vcc_batt', sa.Float(), nullable=True),
    sa.Column('vcc_aux', sa.Float(), nullable=True),
    sa.Column('vccaux_pmc', sa.Float(), nullable=True),
    sa.Column('vccaux_sysmon', sa.Float(), nullable=True),
    sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
    sa.ForeignKeyConstraint(['temperature_id'], ['temperatures.id'], ),
    sa.ForeignKeyConstraint(['test_id'], ['build_ids.id'], ),
    sa.ForeignKeyConstraint(['voltage_id'], ['voltages.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('project_id', 'voltage_id', 'temperature_id', 'test_id', 's_suite', 'suite', 'test_name', name='_unique_test_instances')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('test_instances')
    # ### end Alembic commands ###
