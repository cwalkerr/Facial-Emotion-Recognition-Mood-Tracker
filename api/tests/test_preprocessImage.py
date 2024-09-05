import base64
import cv2
import pytest
import numpy as np
from preprocessing.preprocessImage import PreprocessingError, b64_to_numpy, detect_and_crop_to_face, find_largest_face, greyscale, resize

@pytest.fixture
def dummy_rgb_image():
    return np.zeros((100, 100, 3), dtype=np.uint8)

# Test converting base64 image to numpy array and decoding to cv2 image
def test_b64_to_numpy():
    b64 = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAIBAQEBAQIBAQECAgICAgQDAgICAgUEBAMEBgUGBgYFBgYGBwkIBgcJBwYGCAsICQoKCgoKBggLDAsKDAkKCgr/wAALCAAwADABAREA/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/9oACAEBAAA/APC9PdfB+kW1ho/h17wKnlpBFKkYQAdWZjwK57xT8ade8E3Budd8HeH7iNCGFqPEypKo7E7wAfoK7z4EftT6rrF/5Gv+FI7CG4QII47hZkweh46+ua9a+IPjq0+HejaxquseHBfR3V7FJaQ2igtMHjBBGSMDIOfSvkP9oXwPdfHmyl1XQPh9aaNdO3z2914og3OcdVTGcH0PNfG3jLwr4j+H+szeE/FenmGVCGADhlZT0IYcEe47196fF7wN8S/E/hu407wHqj6fLcRlVvE+8MjoPT69a8UuP2GdR1SfTpZdDntrlUVdXvptU+0GVuQ0qZG4k5zggYKjtxXe/s6fBnxt4A+IcPhzWpomsPtu2w2MxxGWBAIYDBHOccfSvuj9qH4C6nr/AMLbe18IuY7qKxSWMsuRu2EgZ7DOMkZr4G8QfsPeLdet7a51Tw61zrv2p21GU3wEMiseNobDDHPPXngjFec/Gv8AYu+LvhBbmTUNDvZtGVV/sl5bk3UsO1QDvdc7QxBOBkLxzX3p8PYWngGm6nZxHBG39/GcnP8AvV2jeBNMijN1NaIIVUk5uYwAPc7q4rwBHaeOfi9DcabpMcem6cwdbl5U/fbTztAOTz6elfbfi2HS7bwnb6hb2TahAtjG7x2silyhXOVH07d8V55aeD/h58QIY9e8E6rbzRyMd6OAHQ+jL2NdO/wp8G6fZRN4lsYbqQD/AFWAVX0x/hXyL8PNGtILqTUdenMFqxxblnCF27kE9RUfxY8S6hb6PH4d0q4Yi/Z1MuMHyR1+hPA/GuC8H6l8Q7n4maXeafq8ltY2g8l9Kh08EXHy4yXxuXGMjBA9c17n8LW/aN8T+MdI8efDb4jS3GlWtithqngvUbCNbaQjrOswG8SZ7EkY4wOtX/iZ4e8X/s7fF2z1vTHK6N4lnKTW8bHbbXeNxC/7DDOPQqfWvXPBOu32vwhblnfaoIMh/SvnTxjoV9rPk+I9Nnhks1tEliG7kqfm3DjHQiuO+MeszaF4WXxEMRx2ViSZz/Dlsk/lisH9ny38TfFjUbfV/CPxp0tZCjyxxW2sqXQKFODtbIyG544712nizxv8af2ZfDSa9qv7QOhWi3VjFcfY7zX445Jd7bRtWQ/NwCdwGDjFd18GPjHL+138BbLWdZ1EX91ZayjRXrBcyBW45XjgE845GK928F6A2mwNI6kZTB56Y718Bfs0/HI/ELwGvw3vNUk/tPwxaRQz27Sn9/asW8mXHfGCh91HrXoXiKTT9d8KS6BqWnQ3UMsLxzW8yZWRWGCDXkPwX/Yr+Emv+JDBpMzQxCZ5BBcNg2wB5j3Y+cDoM8/Wuzvv+Cefwj8ceCW8JWmhxxpIViufEE0ClrWMZzsBOdxIIUdM9q+qvgd8AfAXwI8CaT4F+GujCz02xixJG4+eRz1kcnqx4z6VtftJ/tDeBv2Z/glq/wAWvGd0FtdMtWaKFSA9zMeI4EHdmYgD8T2Nf//Z" 
    decoded_image = base64.b64decode(b64)
    np_image = np.frombuffer(decoded_image, dtype=np.uint8)
    expected_output = cv2.imdecode(np_image, cv2.IMREAD_COLOR)
    np.testing.assert_array_equal(b64_to_numpy(b64), expected_output)
    
    
def test_b64_to_numpy_invalid_base64():
    base64_image = "invalid_base64_image"
    with pytest.raises(PreprocessingError) as e:
        b64_to_numpy(base64_image)
    assert "Error in decoding base64 image" in str(e.value)


def test_b64_to_numpy_empty_base64():
    base64_image = ""
    with pytest.raises(PreprocessingError) as e:
        b64_to_numpy(base64_image)
    assert "Error in decoding base64 image" in str(e.value)


def test_b64_to_numpy_none_base64():
    base64_image = None
    with pytest.raises(PreprocessingError) as e:
        b64_to_numpy(base64_image)
    assert "Error in decoding base64 image" in str(e.value)



def test_greyscale_valid_image(dummy_rgb_image):
    expected_output = cv2.cvtColor(dummy_rgb_image, cv2.COLOR_BGR2GRAY)
    np.testing.assert_array_equal(greyscale(dummy_rgb_image), expected_output)
    

def test_greyscale_invalid_input():
    invalid_input = "invalid_input"
    
    with pytest.raises(PreprocessingError) as e:
        greyscale(invalid_input)
    assert "Error in greyscaling image" in str(e.value)
    
    

def test_find_largest_face():
    faces = [(10, 10, 50, 50), (20, 20, 100, 100), (30, 30, 30, 30)]
    assert find_largest_face(faces) == (20, 20, 100, 100)

    faces = []
    assert find_largest_face(faces) == None
    

# Valid test case not included for detect_and_crop_to_face as it requires a valid image to detect face
def test_detect_and_crop_to_face_no_face(dummy_rgb_image):
    grey_image = cv2.cvtColor(dummy_rgb_image, cv2.COLOR_BGR2GRAY)

    with pytest.raises(PreprocessingError) as e:
        detect_and_crop_to_face(grey_image)
    assert "No face detected" in str(e.value)
    

def test_detect_and_crop_to_face_invalid_input():
    invalid_input = "invalid_input"

    with pytest.raises(PreprocessingError) as e:
        detect_and_crop_to_face(invalid_input)
    assert "Error in detecting and cropping face" in str(e.value)
    


def test_resize_valid_image():
    image = np.zeros((100, 100, 3), dtype=np.uint8)
    
    # Resize the image using the resize function
    resized_image = resize(image)
    
    # Check the shape of the resized image
    assert resized_image.shape == (48, 48, 3)
    

def test_resize_invalid_input():
    # Create an invalid input (not an image)
    invalid_input = "not_an_image"
    
    # Test that the function raises an exception
    with pytest.raises(PreprocessingError) as e:
        resize(invalid_input)
    assert "Error in resizing image" in str(e.value)
