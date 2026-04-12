import numpy as np


"""
Analysis utilities for temperature signals.

Current role
------------
At this stage, analysis is intentionally simple:
1. Apply a placeholder linear calibration model.
2. Summarize the resulting signal with basic statistics.

Notes
-----
The calibration parameters are placeholders meant to be replaced later when
better calibration data become available across the true target temperature range.
"""


def calibrate_temperature(temp_signal, scale=1.0, offset=0.0):
    """
    Apply a simple linear calibration model to a temperature signal.

    Parameters
    ----------
    temp_signal : array-like of shape (n_samples,)
        One temperature signal.

    scale : float, default=1.0
        Multiplicative calibration factor.

    offset : float, default=0.0
        Additive calibration factor.

    Returns
    -------
    np.ndarray
        Calibrated signal.

    Formula
    -------
        calibrated = scale * temp_signal + offset
    """
    temp_signal = np.asarray(temp_signal, dtype=float)

    if temp_signal.ndim != 1:
        raise ValueError("temp_signal must be 1D")

    return scale * temp_signal + offset


def analyze_temperature(temp_signal, scale=1.0, offset=0.0):
    """
    Analyze one preprocessed temperature signal.

    Parameters
    ----------
    temp_signal : array-like of shape (n_samples,)
        One preprocessed temperature signal.

    scale : float, default=1.0
        Calibration scale used in the linear model.

    offset : float, default=0.0
        Calibration offset used in the linear model.

    Returns
    -------
    dict
        Dictionary containing calibrated signal and summary statistics.

        Keys
        ----
        - "preprocessed_mean"
        - "preprocessed_median"
        - "preprocessed_min"
        - "preprocessed_max"
        - "calibrated_mean"
        - "calibrated_median"
        - "calibrated_min"
        - "calibrated_max"
        - "calibrated"
        - "calibration"

    Notes
    -----
    The signal entering this function is assumed to already be preprocessed.
    The truly original signal is stored separately in the overall pipeline output.
    """
    temp_signal = np.asarray(temp_signal, dtype=float)

    if temp_signal.ndim != 1:
        raise ValueError("temp_signal must be 1D")

    if temp_signal.size == 0:
        raise ValueError("temp_signal cannot be empty")

    calibrated = calibrate_temperature(temp_signal, scale=scale, offset=offset)

    return {
        "preprocessed_mean": float(np.mean(temp_signal)),
        "preprocessed_median": float(np.median(temp_signal)),
        "preprocessed_min": float(np.min(temp_signal)),
        "preprocessed_max": float(np.max(temp_signal)),
        "calibrated_mean": float(np.mean(calibrated)),
        "calibrated_median": float(np.median(calibrated)),
        "calibrated_min": float(np.min(calibrated)),
        "calibrated_max": float(np.max(calibrated)),
        "calibrated": calibrated,
        "calibration": {
            "scale": float(scale),
            "offset": float(offset),
        },
    }