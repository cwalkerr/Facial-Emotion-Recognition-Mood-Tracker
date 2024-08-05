from fastapi.responses import JSONResponse
import requests
import os
import numpy as np
from dotenv import load_dotenv
from db.models import Emotion

load_dotenv()
 
def forward_to_serving(imageData: np.ndarray) -> dict:
    """
    Forwards image data to TensorFlow Serving, running in a Docker container
    
    Parameters:
    imageData (np.ndarray): NumPy array of the image data
    
    Returns:
    dict: A dictionary containing 'prediction' (string) and 'confidence' (float)
    
    Raises:
    ValueError: If the image shape is not (48, 48, 1)
    """    
    # Do not proceed if the image shape is not (48, 48, 1)
    if imageData.shape != (48, 48, 1):
        raise ValueError(f"Unexpected image shape: {imageData.shape} - Expected: (48, 48, 1)")   
    try:
        response = requests.post(
            os.getenv("MODEL_PREDICT_URL"), # this is the url the docker container is running on
            json={"instances": [{"input_layer_1": imageData.tolist()}]}, # must match the input layer name in the model and must be a list
        )
                
        prediction = response.json()
        most_likely_emotion_index = int(np.argmax(prediction["predictions"][0])) # get the index of the highest confidence - maps to Emotion enum
        confidence = prediction["predictions"][0][most_likely_emotion_index]        
                
        return {"prediction": Emotion(most_likely_emotion_index).name, "confidence": confidence}

    except Exception as error:
        print("Error in Forward to Serving: ", error)
