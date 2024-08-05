import cv2
import numpy as np
import base64

## Preprocess the image by greyscaling, detecting face, cropping to bounding box, and resizing
# Note: do not normalise the pixel values as the first stage of the model does this
# if the image is normalised before, then it will be normalised twice resulting in dark images

def b64_to_numpy(base_64_image: str) -> np.ndarray:
    try:
        # decode the base64 image
        decoded_image = base64.b64decode(base_64_image)
        # convert the image to numpy array
        np_image = np.frombuffer(decoded_image, dtype=np.uint8)
        # decode the numpy array to image formay that opencv can read
        cv2_image = cv2.imdecode(np_image, cv2.IMREAD_COLOR)

        if cv2_image is None:
                raise ValueError("Failed to decode image")

        return cv2_image # cv2 image is still a numpy array
    except Exception as e:
        print(e)
        raise

# greyscale the image
def greyscale(image: np.ndarray) -> np.ndarray:
    try:
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    except Exception as e:
        print("Error in greyscaling image:", e)
        raise

def detect_and_crop_to_face(image: np.ndarray) -> np.ndarray:
    try:
        # load the haarcascade for face detection
        haar_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')    
        
        # check if haarcascade was loaded
        if haar_cascade.empty():
            raise IOError("Failed to load haarcascade")
        
        # detect faces in the image
        face = haar_cascade.detectMultiScale(image, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))
        
        # throw error if no face is detected
        if len(face) == 0:
            raise ValueError("No face detected")
        
        # get the largest face in case multiple faces are detected
        if len(face) > 1:
            x, y, w, h = find_largest_face(face)
        else:
            x, y, w, h = face[0]

        # crop the image to the detected face
        cropped_face = image[y:y+h, x:x+w]
        
        return cropped_face
    
    except Exception as e:
        print("Error in detecting and cropping face:", e)
        raise
    
# find the largest face in the image - 
# haarcascadae often mistakenly detects multiple faces - the largest is usually the correct one
def find_largest_face(faces: list) -> tuple:
    largest_face = None
    max_area = 0
    
    for x, y, w, h in faces:
        area = w * h
        if area > max_area:
            max_area = area
            largest_face = (x, y, w, h)
            
    return largest_face
    
# resize the image to 48x48 as expected by the model
def resize(image: np.ndarray) -> np.ndarray:
    try:
        return cv2.resize(image, (48, 48), interpolation=cv2.INTER_AREA)
    except Exception as e:
        print("Error in resizing image:", e)
        raise
    
# preprocessing pipeline
def preprocess(base64_image: str) -> np.ndarray:
    
    np_image = b64_to_numpy(base64_image)
    greyscale_image = greyscale(np_image)
    cropped_face = detect_and_crop_to_face(greyscale_image)
    resized_image = resize(cropped_face)
    # add the channel dimension to match the model input shape
    preprocessed_image = np.expand_dims(resized_image, axis=-1)

    return preprocessed_image
