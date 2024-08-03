from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from forwardImageToServing import forward_to_serving

router = APIRouter()

# API endpoint to upload an image
@router.post("/predict")
async def upload_image( image: str):
    try:
        result = forward_to_serving(image)  # forward image to TensorFlow Serving
    
        prediction, confidence = result["prediction"], result["confidence"]
        
        return JSONResponse(content={"prediction": prediction, "confidence": confidence}, status_code=200)
    except Exception as error:
        return JSONResponse(content={"message": str(error)}, status_code=400)

__all__ = ["router"]