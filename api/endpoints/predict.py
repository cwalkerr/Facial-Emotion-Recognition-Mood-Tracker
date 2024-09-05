from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from preprocessing.preprocessImage import PreprocessingError, preprocess
from services.forward_to_serving import forward_to_serving
from services.verifyToken import verify_token

router = APIRouter()
security = HTTPBearer()

class ImageRequest(BaseModel):
    image: str

# API endpoint to upload an image
@router.post("/predict")
def upload_image( request: ImageRequest, token: HTTPAuthorizationCredentials = Depends(security)
)-> JSONResponse:
    """
    Upload an image for prediction.

    Uploads an image for prediction by ML model. Token is verified before processing the image. The image is preprocessed and forwarded to TensorFlow Serving for prediction.

    Args:
        request (ImageRequest): The image data to be uploaded.
        token (HTTPAuthorizationCredentials): The authorisation token provided by the user.

    Returns:
        JSONResponse: A JSON response containing the prediction and confidence level, or an error message.

    Raises:
        PreprocessingError: If there is an error in preprocessing the image.
        HTTPException: If invalid data is provided in the request.
        Exception: For any other unexpected errors.

    Responses:
        200: Prediction retrieved successfully.
        401: Unauthorized - Invalid token.
        500: Internal Server Error - Error retrieving prediction or preprocessing image.
    """
    try:
        verification = verify_token(token.credentials)
        if (verification["valid"] == False):
            return JSONResponse(content={"message": verification["message"]}, status_code=401)
        
        preprocessed_image = preprocess(request.image)
        result = forward_to_serving(preprocessed_image)  # forward image to TensorFlow Serving as np array
    
        prediction, confidence = result["prediction"], result["confidence"]
        
        return JSONResponse(content={"prediction": prediction, "confidence": confidence}, status_code=200)
    except PreprocessingError as e:
        print("Error in preprocessing image")
        print("Developer message:", e.developer_message)
        return JSONResponse(content={"error": e.user_message}, status_code=400)
    except Exception as e:
        print("Unexpected error: ", e.with_traceback)
        return JSONResponse(content={"error": "Error retrieving prediction, please try again"}, status_code=500)