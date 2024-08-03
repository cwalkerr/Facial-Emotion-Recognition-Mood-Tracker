from fastapi.responses import JSONResponse
import requests
import os
import base64
import numpy as np
from PIL import Image
import io 
from dotenv import load_dotenv
from models import Emotion

load_dotenv()
 
def forward_to_serving(imageData: str):
    """
    Forwards image data to TensorFlow Serving, running in a Docker container
    
    Parameters:
    imageData (str): Base64 encoded image data # May change to bytes
    
    Returns:
    dict: A dictionary containing 'prediction' (string) and 'confidence' (float)
    
    Raises:
    ValueError: If the image shape is not (48, 48, 1)
    """
    
    image_data = base64.b64decode(imageData.split(",")[1]) # remove the "data:image/jpeg;base64" metadata prefix
    image = Image.open(io.BytesIO(image_data))
    
    image_array = np.array(image).expand_dims(axis=2) # convert to numpy array and add channel dimension
    
    # Do not proceed if the image shape is not (48, 48, 1)
    if image_array.shape != (48, 48, 1):
        raise ValueError(f"Unexpected image shape: {image_array.shape} - Expected: (48, 48, 1)")
    
    try:
        prediction = requests.post(
            os.getenv("MODEL_PREDICT_URL"), # this is the url the docker container is running on
            json={"instances": [{"input_layer_1": image_array.tolist()}]}, # must match the input layer name in the model and must be a list
        )
        
        most_likely_emotion_index = np.argmax(prediction["predictions"][0]) # get the index of the highest confidence - maps to Emotion enum
        confidence = prediction["predictions"][0][most_likely_emotion_index]

        
        return {"prediction": Emotion[most_likely_emotion_index].name, "confidence": confidence}
    except Exception as error:
        print(f"Error in Forward to Serving : {error}")
