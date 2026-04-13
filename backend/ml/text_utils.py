import numpy as np


def to_1d_array(x):
    """Flatten ColumnTransformer output for text vectorizers."""
    return np.asarray(x).ravel()

