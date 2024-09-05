import pytest
import numpy as np
from services.forward_to_serving import forward_to_serving
from constants.emotion_enum import Emotions

# test that the model is returning a prediction and confidence level
@pytest.mark.integration
def test_forward_to_serving_integration():
    image_data = np.random.rand(48, 48, 1)

    result = forward_to_serving(image_data)

    assert 'prediction' in result
    assert 'confidence' in result

    assert isinstance(result['prediction'], str)
    assert isinstance(result['confidence'], float)

    assert result['confidence'] >= 0.0 and result['confidence'] <= 1.0
    assert result['prediction'] in [emotion.name for emotion in Emotions]
