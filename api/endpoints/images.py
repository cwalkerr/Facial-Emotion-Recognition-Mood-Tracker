from fastapi import APIRouter
from fastapi.responses import JSONResponse
from PIL import Image
from pydantic import BaseModel
import base64
import os
import io

router = APIRouter()

TEST_IMAGES_PATH = os.path.join(os.path.dirname(__file__), "../test_images")
os.makedirs(TEST_IMAGES_PATH, exist_ok=True)

class ImageResponse(BaseModel):
    image: str
    fileName: str

# API endpoint to upload an image
@router.post("/images")
async def upload_image( response: ImageResponse):
    try:
        image_data = base64.b64decode(response.image)
        path = os.path.join(TEST_IMAGES_PATH, response.fileName)
        
        with open(path, "wb") as file:
            file.write(image_data)
        
        return JSONResponse(content={"message": "image uploaded successfully"})
    except Exception as error:
        return JSONResponse(content={"message": str(error)}, status_code=400)

__all__ = ["router"]