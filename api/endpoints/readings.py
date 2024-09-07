from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from services.verifyToken import verify_token
from db.connection import Session
from db.queries import insert_reading, select_emotion_counts_over_time, select_user_readings

router = APIRouter()
security = HTTPBearer()

class ReadingData(BaseModel):
    emotion: str
    is_accurate: bool
    location: Optional[str] = None
    note: Optional[str] = None
    timestamp: str
    clerk_id: str

@router.post("/readings")
async def upload_reading( 
    request: ReadingData,
    # token: HTTPAuthorizationCredentials = Depends(security)
) -> JSONResponse:
    """
    Upload a new reading.

    Uploads a new emotion reading. Token is verified before the reading is saved to the database.

    Args:
        request (ReadingData): The reading data to be uploaded.
        token (HTTPAuthorizationCredentials): The authorisation token provided by the user.

    Returns:
        JSONResponse: A JSON response containing the added reading data, or an error message.

    Raises:
        HTTPException: If invalid data is provided in the request.
        Exception: For any other unexpected errors.

    Responses:
        201: Reading uploaded successfully.
        401: Unauthorised - Invalid token.
        500: Internal Server Error - Error uploading reading.
    """
    try :
        # verify token
        # verification = verify_token(token.credentials)
        # if (verification["valid"] == False):
        #     return JSONResponse(content={"message": verification["message"]}, status_code=401)
        # save reading to db
        async with Session() as session:
            response, status_code = await insert_reading(session, request)
            return JSONResponse(content=response, status_code=status_code)
    except HTTPException as e:
        return JSONResponse(content={"error": str(e.detail)}, status_code=e.status_code)
    except Exception as e:
        print("Unexpected error: ", e.with_traceback)
        return JSONResponse(content={"error": "Error uploading reading, please try again"}, status_code=500)

 
@router.get('/readings')
async def get_user_readings(
    clerk_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    emotion: Optional[str] = None,
    location: Optional[str] = None,
    token: HTTPAuthorizationCredentials = Depends(security)
) -> JSONResponse:
    """
    Retrieve user readings.

    Retrieve a users readings based on various optional filters such as date range, emotion, and location. Token is verified before fetching the readings from the database.

    Args:
        clerk_id (str): User ID whose readings are to be retrieved.
        start_date (Optional[str], optional): The start date for filtering readings. Defaults to None.
        end_date (Optional[str], optional): The end date for filtering readings. Defaults to None.
        emotion (Optional[str], optional): The emotion to filter readings by. Defaults to None.
        location (Optional[str], optional): The location to filter readings by. Defaults to None.
        token (HTTPAuthorizationCredentials): The authorisation token provided by the user.

    Returns:
        JSONResponse: A JSON response containing the filtered readings ordered by time (desc), or an error message.

    Raises:
        HTTPException: Invalid query parameters.
        Exception: For any other unexpected errors.

    Responses:
        200: Readings retrieved successfully.
        401: Unauthorised - Invalid token.
        500: Internal Server Error - Error retrieving readings.
    """
    try:
        verification = verify_token(token.credentials)
        if (verification["valid"] == False):
            return JSONResponse(content={"message": verification["message"]}, status_code=401)
        
        async with Session() as session:    
            response = await select_user_readings(session, clerk_id, start_date, end_date, emotion, location)
            return JSONResponse(content=response, status_code=200)

    except HTTPException as e:
        return JSONResponse(content={"error": str(e.detail)}, status_code=e.status_code)    
    except Exception as e:
        print("Unexpected error: ", e.with_traceback)
        return JSONResponse(content={"error": "Error retrieving readings, please try again"}, status_code=500)

        
@router.get('/readings/emotion-counts')
async def get_emotion_counts(
    clerk_id: str,
    timeframe: str,
    emotions: List[str] = Query(None),
    token: HTTPAuthorizationCredentials = Depends(security)
) -> JSONResponse:
    """
    Retrieve emotion counts over time. Used in line chart.

    Retrieve emotion count data over a specified timeframe. Token is verified before fetching the emotion counts from the database.

    Args:
        clerk_id (str): User ID whose readings are to be retrieved.
        timeframe (str): The timeframe for which the emotion counts are to be retrieved. Possible values are '7d', '30d', and '52w'.
        emotions (List[str], optional): A list of emotions to filter the counts by. Defaults to None.
        token (HTTPAuthorizationCredentials): The authorisation token provided by the user.
        
    Returns:
        JSONResponse: A JSON response containing the formatted emotion counts, or an error message.
                
    Raises:
        HTTPException: If invalid query parameters are provided.
        Exception: For any other unexpected errors.

    Responses:
        200: Emotion counts retrieved successfully.
        401: Unauthorised - Invalid token.
        500: Internal Server Error - Error retrieving emotion counts.
    """
    try:
        verification = verify_token(token.credentials)
        if not verification["valid"]:
            return JSONResponse(content={"message": verification["message"]}, status_code=401)
        
        async with Session() as session:
            formatted_counts = await select_emotion_counts_over_time(session, clerk_id, emotions, timeframe)
            return JSONResponse(content=formatted_counts, status_code=200)
        
    except HTTPException as e:
        return JSONResponse(content={"error": str(e.detail)}, status_code=e.status_code)
    except Exception as e:
        print("Unexpected error: ", e.with_traceback)
        return JSONResponse(content={"error": "Error retrieving emotion counts, please try again"}, status_code=500)