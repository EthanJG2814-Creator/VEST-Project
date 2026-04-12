import numpy as np


"""
Analysis utilities for accelerometer-based activity detection.

Current scoring idea
--------------------
This pipeline uses the magnitude of the 3-axis accelerometer vector and then scores
activity one second at a time using mean absolute deviation (MAD) within each
1-second window.

Interpretation:
- If the accelerometer magnitude stays nearly constant over a second, the MAD is low.
  That suggests inactivity or very little motion.
- If the magnitude changes noticeably within a second, the MAD is higher.
  That suggests activity.
"""


def compute_magnitude(accel_signal):
    """
    Compute vector magnitude for accelerometer data.

    Parameters
    ----------
    accel_signal : array-like
        Supported shapes:
        - (n_samples, 3): one accelerometer
        - (n_sensors, n_samples, 3): multiple accelerometers

        The last dimension must always be the x, y, z components.

    Returns
    -------
    np.ndarray
        If input shape is (n_samples, 3), output shape is (n_samples,).
        If input shape is (n_sensors, n_samples, 3), output shape is
        (n_sensors, n_samples).

    How it is computed
    ------------------
    For each sample:
        magnitude = sqrt(x^2 + y^2 + z^2)

    Why magnitude is useful
    -----------------------
    It collapses 3 axes into one motion-intensity signal. This makes downstream
    activity scoring simpler and orientation-agnostic.
    """
    accel_signal = np.asarray(accel_signal, dtype=float)

    if accel_signal.ndim not in (2, 3):
        raise ValueError(
            "accel_signal must have shape (n_samples, 3) or (n_sensors, n_samples, 3)"
        )

    if accel_signal.shape[-1] != 3:
        raise ValueError("The last dimension of accel_signal must have size 3 for x, y, z")

    return np.sqrt(np.sum(accel_signal ** 2, axis=-1))



def compute_window_mad(window):
    """
    Compute mean absolute deviation (MAD) relative to the window mean.

    Parameters
    ----------
    window : array-like of shape (window_length,)
        One 1D segment of the magnitude signal.

    Returns
    -------
    float
        Mean absolute deviation of that window.

    How it is computed
    ------------------
    1. Compute the window mean.
    2. Compute the absolute difference between each sample and that mean.
    3. Average those absolute differences.

    Formula
    -------
        MAD = mean(|x_i - mean(x)|)

    Interpretation
    --------------
    - Small MAD: signal is fairly flat during that second.
    - Large MAD: signal varies more during that second.
    """
    window = np.asarray(window, dtype=float)

    if window.ndim != 1:
        raise ValueError("window must be 1D")

    if window.size == 0:
        raise ValueError("window cannot be empty")

    window_mean = np.mean(window)
    return float(np.mean(np.abs(window - window_mean)))



def get_active_seconds(magnitude, sampling_rate, second_threshold):
    """
    Score a magnitude signal one second at a time and count active seconds.

    Parameters
    ----------
    magnitude : array-like of shape (n_samples,)
        1D magnitude signal for one accelerometer.

    sampling_rate : int
        Number of samples per second.

        How it is used:
        The function groups samples into non-overlapping 1-second windows, so each
        window contains exactly ``sampling_rate`` samples.

    second_threshold : float
        Decision threshold for a 1-second window.

        How it is used:
        - If MAD(window) > second_threshold, that second is labeled active.
        - Otherwise, that second is labeled inactive.

    Returns
    -------
    tuple
        active_seconds : int
            Number of 1-second windows labeled active.

        second_scores : np.ndarray of shape (n_full_seconds,)
            MAD score for each full second.

        n_full_seconds : int
            Number of complete 1-second windows available in the signal.

        second_labels : np.ndarray of shape (n_full_seconds,)
            Boolean labels per second where True means active.

    Notes
    -----
    Any leftover samples at the end that do not form a complete second are ignored.
    """
    magnitude = np.asarray(magnitude, dtype=float)

    if magnitude.ndim != 1:
        raise ValueError("magnitude must be 1D")

    if sampling_rate <= 0:
        raise ValueError("sampling_rate must be positive")

    n_full_seconds = len(magnitude) // sampling_rate
    second_scores = []
    second_labels = []
    active_seconds = 0

    for sec in range(n_full_seconds):
        start = sec * sampling_rate
        end = start + sampling_rate
        window = magnitude[start:end]

        score = compute_window_mad(window)
        is_active = score > second_threshold

        second_scores.append(score)
        second_labels.append(is_active)

        if is_active:
            active_seconds += 1

    return (
        active_seconds,
        np.asarray(second_scores, dtype=float),
        n_full_seconds,
        np.asarray(second_labels, dtype=bool),
    )



def analyze_accelerometer(magnitude, sampling_rate=10, second_threshold=0.05):
    """
    Analyze one accelerometer magnitude signal.

    Parameters
    ----------
    magnitude : array-like of shape (n_samples,)
        1D magnitude signal for one sensor.

    sampling_rate : int, default=10
        Number of samples per second.

    second_threshold : float, default=0.05
        MAD threshold used to label each second as active or inactive.

    Returns
    -------
    dict
        Dictionary containing second-level analysis results.

        Keys:
        - "active_seconds": number of seconds labeled active
        - "num_seconds_used": number of full seconds analyzed
        - "second_scores": MAD score for each second
        - "second_labels": boolean active/inactive label for each second
        - "second_threshold": threshold used in the decision rule
    """
    active_seconds, second_scores, n_full_seconds, second_labels = get_active_seconds(
        magnitude=magnitude,
        sampling_rate=sampling_rate,
        second_threshold=second_threshold,
    )

    return {
        "active_seconds": active_seconds,
        "num_seconds_used": n_full_seconds,
        "second_scores": second_scores,
        "second_labels": second_labels,
        "second_threshold": float(second_threshold),
    }
