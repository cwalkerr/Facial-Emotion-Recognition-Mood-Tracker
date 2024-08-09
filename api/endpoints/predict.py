from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from preprocessing.preprocessImage import preprocess
from services.forwardImageToServing import forward_to_serving

router = APIRouter()


class ImageRequest(BaseModel):
    image: str

# API endpoint to upload an image
@router.post("/predict")
def upload_image( request: ImageRequest) -> JSONResponse:
    try:
        preprocessed_image = preprocess(request.image)
        result = forward_to_serving(preprocessed_image)  # forward image to TensorFlow Serving as np array
    
        prediction, confidence = result["prediction"], result["confidence"]
        
        return JSONResponse(content={"prediction": prediction, "confidence": confidence}, status_code=200)
    except Exception as error:
        return JSONResponse(content={"message": str(error)}, status_code=400)

__all__ = ["router"]