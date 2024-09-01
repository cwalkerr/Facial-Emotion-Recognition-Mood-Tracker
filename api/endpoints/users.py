from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from services.verifyToken import verify_token
from db.models import User
from db.connection import Session
from pydantic import BaseModel
from services.celery.tasks import start_user_notification_scheduler

router = APIRouter()    
security = HTTPBearer()

class Users(BaseModel):
    id: str
    start_time: str
    end_time: str
    
# adds the users clerk id to the database
@router.post("/users")
async def add_user(request: Users, token: HTTPAuthorizationCredentials = Depends(security)) -> Response:
    try:
        verification = verify_token(token.credentials)
        if (verification["valid"] == False): # check if token is invalid
            return JSONResponse(content={"message": verification["message"]}, status_code=401)
        # add clerk id to the database
        async with Session() as session:
            new_user = User(
                clerk_id=request.id, 
                notification_start_time=request.start_time, 
                notification_end_time=request.end_time
            )
            session.add(new_user)
            await session.commit()
            
            # start the user's notification scheduler
            start_user_notification_scheduler(request.id, request.start_time, request.end_time)
            
        return JSONResponse(content={"message": "User added successfully"}, status_code=201)
    except HTTPException as e:
        return JSONResponse(content={"error": e.detail}, status_code=e.status_code)
    except Exception as e:
        print("Unexpected error: ", e.with_traceback)
        return JSONResponse(content={"error": "Error adding user, please try again"}, status_code=500)