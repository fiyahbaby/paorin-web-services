"""Initial migration

Revision ID: b9aeea858458
Revises: 
Create Date: 2023-06-21 16:38:28.981224

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b9aeea858458'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('projects',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('device_name', sa.String(length=255), nullable=True),
    sa.Column('revision_id', sa.Integer(), nullable=True),
    sa.Column('test_type_id', sa.Integer(), nullable=True),
    sa.Column('block_id', sa.Integer(), nullable=True),
    sa.Column('date_created', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('temperatures',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('temperature', sa.Float(), nullable=True),
    sa.Column('project_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('units',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('process_corner', sa.String(length=255), nullable=True),
    sa.Column('two_d_name', sa.String(length=255), nullable=True),
    sa.Column('device_dna', sa.String(length=255), nullable=True),
    sa.Column('remarks', sa.String(length=255), nullable=True),
    sa.Column('project_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('voltages',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=True),
    sa.Column('value', sa.Float(), nullable=True),
    sa.Column('project_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('tests',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('s_suite', sa.String(length=255), nullable=True),
    sa.Column('suite', sa.String(length=255), nullable=True),
    sa.Column('name', sa.String(length=255), nullable=True),
    sa.Column('dc', sa.String(length=255), nullable=True),
    sa.Column('remarks', sa.String(length=255), nullable=True),
    sa.Column('project_id', sa.Integer(), nullable=True),
    sa.Column('voltage_id', sa.Integer(), nullable=True),
    sa.Column('temperature_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
    sa.ForeignKeyConstraint(['temperature_id'], ['temperatures.id'], ),
    sa.ForeignKeyConstraint(['voltage_id'], ['voltages.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('build_ids',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('time_stamp', sa.String(length=255), nullable=True),
    sa.Column('voltage_id', sa.Integer(), nullable=True),
    sa.Column('temperature_id', sa.Integer(), nullable=True),
    sa.Column('two_d_name', sa.String(length=255), nullable=True),
    sa.Column('test_id', sa.Integer(), nullable=True),
    sa.Column('test_status', sa.String(length=255), nullable=True),
    sa.Column('run_time', sa.String(length=255), nullable=True),
    sa.ForeignKeyConstraint(['temperature_id'], ['temperatures.id'], ),
    sa.ForeignKeyConstraint(['test_id'], ['tests.id'], ),
    sa.ForeignKeyConstraint(['voltage_id'], ['voltages.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('build_ids')
    op.drop_table('tests')
    op.drop_table('voltages')
    op.drop_table('units')
    op.drop_table('temperatures')
    op.drop_table('projects')
    # ### end Alembic commands ###
