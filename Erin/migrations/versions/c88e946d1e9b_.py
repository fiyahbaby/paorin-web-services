"""empty message

Revision ID: c88e946d1e9b
Revises: b9aeea858458
Create Date: 2023-06-23 13:07:01.486452

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c88e946d1e9b'
down_revision = 'b9aeea858458'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('projects', schema=None) as batch_op:
        batch_op.alter_column('revision_id',
               existing_type=sa.INTEGER(),
               type_=sa.String(length=255),
               existing_nullable=True)
        batch_op.alter_column('test_type_id',
               existing_type=sa.INTEGER(),
               type_=sa.String(length=255),
               existing_nullable=True)
        batch_op.alter_column('block_id',
               existing_type=sa.INTEGER(),
               type_=sa.String(length=255),
               existing_nullable=True)
        batch_op.alter_column('date_created',
               existing_type=sa.DATETIME(),
               type_=sa.String(length=255),
               existing_nullable=True)

    with op.batch_alter_table('temperatures', schema=None) as batch_op:
        batch_op.add_column(sa.Column('name', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('value', sa.Float(), nullable=True))
        batch_op.drop_column('temperature')

    with op.batch_alter_table('units', schema=None) as batch_op:
        batch_op.drop_column('device_dna')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('units', schema=None) as batch_op:
        batch_op.add_column(sa.Column('device_dna', sa.VARCHAR(length=255), nullable=True))

    with op.batch_alter_table('temperatures', schema=None) as batch_op:
        batch_op.add_column(sa.Column('temperature', sa.FLOAT(), nullable=True))
        batch_op.drop_column('value')
        batch_op.drop_column('name')

    with op.batch_alter_table('projects', schema=None) as batch_op:
        batch_op.alter_column('date_created',
               existing_type=sa.String(length=255),
               type_=sa.DATETIME(),
               existing_nullable=True)
        batch_op.alter_column('block_id',
               existing_type=sa.String(length=255),
               type_=sa.INTEGER(),
               existing_nullable=True)
        batch_op.alter_column('test_type_id',
               existing_type=sa.String(length=255),
               type_=sa.INTEGER(),
               existing_nullable=True)
        batch_op.alter_column('revision_id',
               existing_type=sa.String(length=255),
               type_=sa.INTEGER(),
               existing_nullable=True)

    # ### end Alembic commands ###
