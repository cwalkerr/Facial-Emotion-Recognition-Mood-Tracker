from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sqlalchemy import desc, select
from services.verifyToken import verify_token
from db.connection import Session
from db.models import GlobalAccuracyCount, Reading, Emotion, Location


router = APIRouter()
security = HTTPBearer()

class ReadingPostRequest(BaseModel):
    emotion: str
    is_accurate: bool
    location: Optional[str] = None
    note: Optional[str] = None
    timestamp: str
    clerk_id: str

@router.post("/reading")
async def upload_reading( 
    request: ReadingPostRequest,
    token: HTTPAuthorizationCredentials = Depends(security)
) -> JSONResponse:
    try :
        # verify token
        verification = verify_token(token.credentials)
        if (verification["valid"] == False):
            return JSONResponse(content={"message": verification["message"]}, status_code=401)
        # save reading to db
        async with Session() as session:
            # get emotion id
            emotion_result = await session.execute(
                select(Emotion.emotion_id).where(Emotion.label == request.emotion.capitalize()))
            emotion_id = emotion_result.scalar_one_or_none()
            if emotion_id is None:
                return JSONResponse(content={"message": "Invalid emotion"}, status_code=400)
            
            # get location id if request.location included
            location_id = None # init to none to prevent error accessing in reading object, could conditionally add it to reading object but this is less verbose
            if (request.location):
                location_result = await session.execute(
                    select(Location.location_id).where(Location.name == request.location.capitalize())
                )
                location_id = location_result.scalar_one_or_none()
                if location_id is None:
                    return JSONResponse(content={"message": "Invalid location"}, status_code=400)
            
            # add the reading
            new_reading = Reading(
                datetime=request.timestamp,
                note=request.note, # will be null if not included
                emotion_id=emotion_id,
                location_id=location_id,
                clerk_id=request.clerk_id
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

# Gets the users readings, can add optional filters for timeframe, emotion and location
# orders by datetime by default, makes it easier to display the most recent on client   
@router.get('/reading')
async def get_user_readings(
    clerk_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    emotion: Optional[str] = None,
    location: Optional[str] = None,
    token: HTTPAuthorizationCredentials = Depends(security)
) -> JSONResponse:
    try:
        verification = verify_token(token.credentials)
        if (verification["valid"] == False):
            return JSONResponse(content={"message": verification["message"]}, status_code=401)
        
        async with Session() as session:
            query = (
                select( # manually adding fields required, 
                       # clerk_id, location_id, emotion_id all not needed
                    Reading.reading_id,
                    Emotion.label, 
                    Location.name,
                    Reading.datetime,
                    Reading.note
                )
                .join(Emotion)
                .outerjoin(Location) # ensures readings are present even if no location was added
                .where(Reading.clerk_id == clerk_id)
                .order_by(desc(Reading.datetime)) # most recent first, todays 3 readings shown in app, so simplifies this
            )
            # provide filter options
            if start_date and end_date:
                query = query.where(
                    Reading.datetime.between(date.fromisoformat(start_date), date.fromisoformat(end_date)))
            elif start_date:
                query = query.where(Reading.datetime >= date.fromisoformat(start_date))
            elif end_date:
                query = query.where(Reading.datetime <= date.fromisoformat(end_date))

            if emotion:
                query = query.where(Emotion.label == emotion.capitalize())
            if location:
                query = query.where(Location.name == location.capitalize())
                
            result = await session.execute(query)
           # use list comprehension to format the data, label/name -> emotion/location
           # also format the date to json readable
           # if no location or note present, key still included just null value, keeps the json consistent
            formatted_readings = [
                {
                    "id": row.reading_id,
                    "emotion": row.label,
                    "location": row.name,
                    "datetime": row.datetime.isoformat(),
                    "note": row.note
                }
                for row in result
            ]
            return JSONResponse(content={"readings": formatted_readings}, status_code=200)
    except Exception as error:
        return JSONResponse(content={"message": str(error)}, status_code=400)
        
    