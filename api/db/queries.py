from datetime import date, datetime, timedelta
from typing import Dict, List, Optional
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session
from db.models import Emotion, Location, Reading, GlobalAccuracyCount
from services.emotion_enum import Emotions

# apply filters to the query based on the provided parameters
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

# get emotion id from emotion label (Happy, Sad, etc.)
async def select_emotion_id(session: Session, emotion_label: str):
    result = await session.execute(
        select(Emotion.emotion_id).where(Emotion.label == emotion_label.capitalize())
    )
    return result.scalar_one_or_none()

# get location id from location name (Home, Work, etc.)
async def select_location_id(session: Session, location_name: str):
    result = await session.execute(
        select(Location.location_id).where(Location.name == location_name.capitalize())
    )
    return result.scalar_one_or_none()

# add a new emotion reading to the database
async def insert_reading(session: Session, request):
    emotion_id = await select_emotion_id(session, request.emotion)
    if emotion_id is None:
        return {"error": "Invalid Emotion"}, 400

    location_id = None
    if request.location:
        location_id = await select_location_id(session, request.location)
        if location_id is None:
            return {"error": "Invalid location"}, 400

    new_reading = Reading(
        datetime=request.timestamp,
        note=request.note,
        emotion_id=emotion_id,
        location_id=location_id,
        clerk_id=request.clerk_id
    )
    session.add(new_reading)

    global_accuracy_count = await session.get(GlobalAccuracyCount, 1)
    if request.is_accurate:
        global_accuracy_count.accurate_readings += 1
    else:
        global_accuracy_count.failed_readings += 1

    await session.commit()
    return {"message": "Reading added successfully"}, 200

# Get the user's readings, can add optional filters for timeframe, emotion and location
async def select_user_readings(session: Session, clerk_id: str, start_date: Optional[str], end_date: Optional[str], emotion: Optional[str], location: Optional[str]):
    query = (
        select( # leaving out clerk_id, location_id, emotion_id
            Reading.reading_id,
            Emotion.label,
            Location.name,
            Reading.datetime,
            Reading.note,
        )
        .join(Emotion)
        .outerjoin(Location) # ensure readings are present even if no location was added
        .where(Reading.clerk_id == clerk_id)
        .order_by(desc(Reading.datetime))
    )
    # if filters are provided, apply them
    query = apply_filters(query, clerk_id, start_date, end_date, emotion, location)
    result = await session.execute(query)
     # format the data, label/name -> emotion/location
    # also format the date to iso compliant string
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
    counts = {str(emotion): 0 for emotion in Emotions}
    for row in count_result:
        counts[row.label] = row.count
    
    # combine the formatted readings and counts into the response
    response = {
        "readings": formatted_readings,
        "counts": counts
    }
    return response

# Get the emotion counts for the user over a specified timeframe used for the line chart
async def select_emotion_counts_over_time(
    session: Session,
    clerk_id: str,
    emotions: List[str],
    timeframe: str
) -> Dict[str, List[Dict[str, int]]]:
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
    return formatted_counts