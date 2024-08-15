from sqlalchemy import select
from fastapi import HTTPException
from db.connection import Session
from db.models import User

async def get_user_id_by_clerk_id(clerk_id: str) -> int:
    async with Session() as session:
        result = await session.execute(select(User.user_id).where(User.clerk_id == clerk_id))
        user_id = result.scalar_one_or_none()
        if user_id is None:
            raise HTTPException(status_code=404, detail="User not found")
        return user_id