"""Edited to enable unique values for all tables

Revision ID: d5ea0440db24
Revises: 8ae72fab2df5
Create Date: 2023-07-24 12:59:35.031897

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd5ea0440db24'
down_revision = '8ae72fab2df5'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('build_ids', schema=None) as batch_op:
        batch_op.create_unique_constraint('_unique_build_ids', ['time_stamp', 'voltage_id', 'temperature_id', 'two_d_name', 'test_id', 'project_id'])

    with op.batch_alter_table('projects', schema=None) as batch_op:
        batch_op.create_unique_constraint('_unique_projects', ['device_name', 'revision_id', 'test_type_id', 'block_id'])

    with op.batch_alter_table('temperatures', schema=None) as batch_op:
        batch_op.create_unique_constraint('_unique_temperatures', ['name', 'project_id'])

    with op.batch_alter_table('tests', schema=None) as batch_op:
        batch_op.alter_column('dc',
               existing_type=sa.VARCHAR(length=255),
               nullable=False)
        batch_op.alter_column('s_suite',
               existing_type=sa.VARCHAR(length=255),
               nullable=False)
        batch_op.alter_column('suite',
               existing_type=sa.VARCHAR(length=255),
               nullable=False)
        batch_op.alter_column('name',
               existing_type=sa.VARCHAR(length=255),
               nullable=False)
        batch_op.alter_column('project_id',
               existing_type=sa.INTEGER(),
               nullable=False)
        batch_op.alter_column('voltage_id',
               existing_type=sa.INTEGER(),
               nullable=False)
        batch_op.alter_column('temperature_id',
               existing_type=sa.INTEGER(),
               nullable=False)
        batch_op.create_unique_constraint('_unique_test_list', ['dc', 's_suite', 'suite', 'name', 'project_id', 'voltage_id', 'temperature_id'])
        batch_op.create_index('ix_test_list_name', ['name'], unique=False)

    with op.batch_alter_table('units', schema=None) as batch_op:
        batch_op.create_unique_constraint('_unique_units', ['process_corner', 'two_d_name', 'project_id'])

    with op.batch_alter_table('voltages', schema=None) as batch_op:
        batch_op.create_unique_constraint('_unique_voltages', ['name', 'project_id'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('voltages', schema=None) as batch_op:
        batch_op.drop_constraint('_unique_voltages', type_='unique')

    with op.batch_alter_table('units', schema=None) as batch_op:
        batch_op.drop_constraint('_unique_units', type_='unique')

    with op.batch_alter_table('tests', schema=None) as batch_op:
        batch_op.drop_index('ix_test_list_name')
        batch_op.drop_constraint('_unique_test_list', type_='unique')
        batch_op.alter_column('temperature_id',
               existing_type=sa.INTEGER(),
               nullable=True)
        batch_op.alter_column('voltage_id',
               existing_type=sa.INTEGER(),
               nullable=True)
        batch_op.alter_column('project_id',
               existing_type=sa.INTEGER(),
               nullable=True)
        batch_op.alter_column('name',
               existing_type=sa.VARCHAR(length=255),
               nullable=True)
        batch_op.alter_column('suite',
               existing_type=sa.VARCHAR(length=255),
               nullable=True)
        batch_op.alter_column('s_suite',
               existing_type=sa.VARCHAR(length=255),
               nullable=True)
        batch_op.alter_column('dc',
               existing_type=sa.VARCHAR(length=255),
               nullable=True)

    with op.batch_alter_table('temperatures', schema=None) as batch_op:
        batch_op.drop_constraint('_unique_temperatures', type_='unique')

    with op.batch_alter_table('projects', schema=None) as batch_op:
        batch_op.drop_constraint('_unique_projects', type_='unique')

    with op.batch_alter_table('build_ids', schema=None) as batch_op:
        batch_op.drop_constraint('_unique_build_ids', type_='unique')

    # ### end Alembic commands ###