from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sqlalchemy import select
from services.verifyToken import verify_token
from db.connection import Session
from db.models import GlobalAccuracyCount, Reading, Emotion, Location
from services.getUserIdByClerkId import get_user_id_by_clerk_id


router = APIRouter()
security = HTTPBearer()

class ReadingRequest(BaseModel):
    emotion: str
    is_accurate: bool
    location: Optional[str] = None
    note: Optional[str] = None
    timestamp: str
    clerk_id: str

@router.post("/reading")
async def upload_reading( 
    request: ReadingRequest,
    token: HTTPAuthorizationCredentials = Depends(security)
) -> JSONResponse:
    try :
        # verify token
        verification = verify_token(token.credentials)
        if (verification["valid"] == False):
            return JSONResponse(content={"message": verification["message"]}, status_code=401)
        # get user id from the clerk id
        user_id = await get_user_id_by_clerk_id(request.clerk_id)
        # save reading to db
        async with Session() as session:
            # get emotion id
            emotion_result = await session.execute(
                select(Emotion.emotion_id).where(Emotion.label == request.emotion.capitalize()))
            emotion_id = emotion_result.scalar_one_or_none()
            if emotion_id is None:
                return JSONResponse(content={"message": "Invalid emotion"}, status_code=400)
            
            # get location id if it is included
            if (request.location):
                location_result = await session.execute(
                    select(Location.location_id).where(Location.name == request.location)
                )
                location_id = location_result.scalar_one_or_none()
                if location_id is None:
                    return JSONResponse(content={"message": "Invalid location"}, status_code=400)
            
            # add the reading
            new_reading = Reading(
                user_id=user_id, 
                datetime=request.timestamp,
                note=request.note,
                emotion_id=emotion_id,
                location_id=location_id
            )
            session.add(new_reading)

            # update the accuracy count
            global_accuracy_count = await session.get(GlobalAccuracyCount, 1)            
            if request.is_accurate:
                global_accuracy_count.accurate_readings += 1
            else:
                global_accuracy_count.failed_readings +=1
            
            await session.commit()
            
        return JSONResponse(content={"message": "Reading uploaded successfully"}, status_code=200)
    except HTTPException as error:
        # this error is thrown by get_user_id... if user not found
        return JSONResponse(content={"message": error.detail}, status_code=error.status_code)
    except Exception as error:
        return JSONResponse(content={"message": str(error)}, status_code=400)