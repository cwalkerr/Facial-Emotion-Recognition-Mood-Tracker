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

class ReadingPostRequest(BaseModel):
    emotion: str
    is_accurate: bool
    location: Optional[str] = None
    note: Optional[str] = None
    timestamp: str
    clerk_id: str

@router.post("/readings")
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
            response, status_code = await insert_reading(session, request)
            return JSONResponse(content=response, status_code=status_code)
    except HTTPException as e:
        return JSONResponse(content={"error": str(e.detail)}, status_code=e.status_code)
    except Exception as e:
        print("Unexpected error: ", e.with_traceback)
        return JSONResponse(content={"error": "Error uploading reading, please try again"}, status_code=500)

# Gets the users readings, can add optional filters for timeframe, emotion and location
# orders by datetime by default, makes it easier to display the most recent on client   
@router.get('/readings')
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
    timeframe: str, # 7(d), 30(d), 52(start of year)
    emotions: List[str] = Query(None),
    token: HTTPAuthorizationCredentials = Depends(security)
) -> JSONResponse:
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