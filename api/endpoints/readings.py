from datetime import date, datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sqlalchemy import desc, select, func
from services.verifyToken import verify_token
from db.connection import Session
from db.models import GlobalAccuracyCount, Reading, Emotion, Location
from services.emotion_enum import Emotions

router = APIRouter()
security = HTTPBearer()

# helper function to apply filters to the query, used in two seperate queries so extracted to function
def apply_filters(query, clerk_id, start_date=None, end_date=None, emotion=None, location=None):
    query = query.where(Reading.clerk_id == clerk_id)
    
    if start_date and end_date:
        query = query.where(
            Reading.datetime.between(date.fromisoformat(start_date), date.fromisoformat(end_date))
        )
    elif start_date:
        query = query.where(Reading.datetime >= date.fromisoformat(start_date))
    elif end_date:
        query = query.where(Reading.datetime <= date.fromisoformat(end_date))

    if emotion:
        query = query.where(Emotion.label == emotion.capitalize())
    if location:
        query = query.where(Location.name == location.capitalize())
    
    return query

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
                    Reading.note,
                )
                .join(Emotion)
                .outerjoin(Location) # ensures readings are present even if no location was added
                .where(Reading.clerk_id == clerk_id)
                .order_by(desc(Reading.datetime)) # most recent first, todays 3 readings shown in app, so simplifies this
            )
            query = apply_filters(query, clerk_id, start_date, end_date, emotion, location)
            result = await session.execute(query)
           # use list comprehension to format the data, label/name -> emotion/location
           # also format the date to iso compliant string minus the seconds
           # if no location or note present, key still included just null value, keeps the json consistent
            formatted_readings = [
                {
                    "id": row.reading_id,
                    "emotion": row.label,
                    "location": row.name,
                    "datetime": row.datetime.strftime('%Y-%m-%dT%H:%M'),
                    "note": row.note,
                }
                for row in result
            ]
            # get the counts of each emotion for the selected readings
            count_query = (
                select(
                    Emotion.label,
                    func.count(Reading.reading_id).label("count")
                )
                .join(Emotion)
                .outerjoin(Location)
                .where(Reading.clerk_id == clerk_id)
                .group_by(Emotion.label)
            )
            count_query = apply_filters(count_query, clerk_id, start_date, end_date, emotion, location)
            count_result = await session.execute(count_query)
            
            # format the counts default 0 value to include all keys in response
            counts = {
                str(emotion): 0 for emotion in Emotions
            }
            for row in count_result:
                counts[row.label] = row.count
            # combine the formatted readings and counts into the response
            response = {
                "readings": formatted_readings,
                "counts": counts
            }
            
            return JSONResponse(content=response, status_code=200)
    except Exception as error:
        return JSONResponse(content={"message": str(error)}, status_code=400)
        
@router.get('/reading/emotion-counts')
async def get_emotion_counts(
    clerk_id: str,
    timeframe: str, # 7(d), 30(d), 52(start of year)
    emotions: List[str] = Query(None),
    token: HTTPAuthorizationCredentials = Depends(security)
) -> JSONResponse:
    try:
        verification = verify_token(token.credentials)
        if not verification["valid"]:
            return JSONResponse(content={"message": verification["message"]}, status_code=401)
        async with Session() as session:
            now = datetime.now()
            if timeframe == '7d': # past 7 days
                # subtract 7 days from now to get the start date
                start_date = now - timedelta(days=7) 
                trunc_value = 'day'
                increment = timedelta(days=1) # provides a daily increment compatible with datetimes to use in the while loop below
            elif timeframe == '30d': # past 30 days
                start_date = now - timedelta (days=30) 
                trunc_value = 'day'
                increment = timedelta(days=1)
            elif timeframe == '1yr': # from year start
                start_date = now.replace(month=1, day=1)  # replace month and day to get start of year
                trunc_value = 'week'
                increment = timedelta(weeks=1) # for year use weekly increments

            # truncates the datetimes in db to required format for grouping using the trunc_value set above 
            # if day - remove the time part so all readings on same day are grouped as the same value
            # if weekly - all dates within that week are grouped as the start date of the week, same for monthly..
            truncated_date = func.date_trunc(trunc_value, Reading.datetime).label('truncated_date')
            
            counts = {}
            for emotion in emotions:
                counts[emotion] = {}
                current_date = start_date
                while current_date <= now:
                    counts[emotion][current_date.strftime('%Y-%m-%d')] = 0
                    current_date += increment

            query = (
                select(
                    func.count(Reading.reading_id).label('count'),
                    truncated_date,
                    Emotion.label
                )
                .join(Emotion)
                .where(
                        Reading.clerk_id == clerk_id,
                        Emotion.label.in_(emotions),
                        Reading.datetime >= start_date,
                        Reading.datetime <= now
                    )
                .group_by(truncated_date, Emotion.label)
                .order_by(truncated_date)
            )

            result = await session.execute(query)
            
            # update the counts dict with the actual counts from the db
            for row in result:
                counts[row.label][row.truncated_date.strftime('%Y-%m-%d')] = row.count
            
            formatted_counts = {
               emotion: [
                {"date": date, "count": count} for date, count in counts.items()
                ]
                for emotion, counts in counts.items()
            }
            
            return JSONResponse(content=formatted_counts, status_code=200)
    
    except Exception as e:
        return JSONResponse(content={"message": str(e)}, status_code=500)