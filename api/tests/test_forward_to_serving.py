import pytest
import numpy as np
from services.forward_to_serving import forward_to_serving

def test_forward_to_serving_invalid_shape():
    image_data = np.random.rand(50, 50, 1) # (48, 48, 1) is expected

    with pytest.raises(ValueError):
        forward_to_serving(image_data)