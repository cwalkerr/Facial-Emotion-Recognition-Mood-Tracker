from fastapi import APIRouter, Depends, Header, Response
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from services.verifyToken import verify_token
from db.models import User
from db.connection import Session
from pydantic import BaseModel

router = APIRouter()    
security = HTTPBearer()

class IDRequest(BaseModel):
    id: str
    
# adds the users clerk id to the database
@router.post("/id")
async def upload_id(request: IDRequest, token: HTTPAuthorizationCredentials = Depends(security)) -> Response:
    try:
        verification = verify_token(token.credentials)
        if (verification["valid"]): # check if valid token is true
            # add the users clerk id to the database
            async with Session() as session:
                    new_user = User(clerk_id=request.id)
                    session.add(new_user)
                    await session.commit()
            return Response(status_code=200) # just return 200 if success no need for any data
        else :
            return JSONResponse(content={"message": verification["message"]}, status_code=401) # return 401 if token is invalid with a message
    except Exception as error:
        return JSONResponse(content={"message": str(error)}, status_code=400)