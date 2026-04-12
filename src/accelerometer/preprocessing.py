import numpy as np


"""
Preprocessing utilities for accelerometer signals.

Design goals
------------
1. Keep preprocessing intentionally light. For activity detection, we usually want
   to reduce small sample-to-sample noise without heavily distorting the motion.
2. Support both single accelerometer input with shape (n_samples, 3) and multiple
   accelerometers with shape (n_sensors, n_samples, 3).
3. Keep output shapes identical to input shapes so downstream code can rely on a
   stable interface.

Terminology
-----------
- A "sample" is one timestamp.
- Each sample has 3 axes: x, y, z.
- A "window" is the number of samples used by the filter.
"""


def moving_average_1d(signal, window=3):
    """
    Smooth a 1D signal with a centered moving average.

    Parameters
    ----------
    signal : array-like of shape (n_samples,)
        The 1D sequence to smooth.

        Example:
        If ``signal`` is one accelerometer axis such as x, then each entry is the
        x-axis reading at one timestamp.

    window : int, default=3
        Number of samples included in the moving-average window.

        How it is used:
        - A larger window produces more smoothing.
        - A smaller window preserves more rapid changes.
        - If ``window <= 1``, no smoothing is applied and a copy is returned.

    Returns
    -------
    np.ndarray of shape (n_samples,)
        Smoothed signal with the same length as the input.

    Notes
    -----
    We use edge padding so that the output length matches the input length.
    For example, if the signal starts with [1, 2, 3] and the window extends past
    the left edge, the edge value is repeated rather than dropping samples.
    """
    signal = np.asarray(signal, dtype=float)

    if signal.ndim != 1:
        raise ValueError("signal must be 1D")

    if window <= 1:
        return signal.copy()

    # For a centered filter, some samples come from the left side of the current
    # point and some come from the right. These values determine how much padding
    # is needed on each side to preserve length.
    pad_left = window // 2
    pad_right = window - 1 - pad_left

    padded = np.pad(signal, (pad_left, pad_right), mode="edge")
    kernel = np.ones(window, dtype=float) / window

    # 'valid' works here because we padded first. That gives a result with the
    # same number of points as the original signal.
    return np.convolve(padded, kernel, mode="valid")



def median_filter_1d(signal, window=3):
    """
    Smooth a 1D signal with a centered median filter.

    Parameters
    ----------
    signal : array-like of shape (n_samples,)
        The 1D sequence to filter.

    window : int, default=3
        Number of samples included in the median window.

        How it is used:
        - The filter looks at a local neighborhood of ``window`` samples.
        - It replaces the current sample with the median of that neighborhood.
        - Median filtering is especially useful when the signal contains spikes or
          isolated outliers, since the median is less sensitive than the mean.

    Returns
    -------
    np.ndarray of shape (n_samples,)
        Filtered signal with the same length as the input.
    """
    signal = np.asarray(signal, dtype=float)

    if signal.ndim != 1:
        raise ValueError("signal must be 1D")

    if window <= 1:
        return signal.copy()

    pad_left = window // 2
    pad_right = window - 1 - pad_left

    padded = np.pad(signal, (pad_left, pad_right), mode="edge")
    out = np.empty_like(signal, dtype=float)

    # For each output position, take the median over the local window.
    for i in range(len(signal)):
        out[i] = np.median(padded[i:i + window])

    return out



def _validate_preprocess_inputs(accel_signal, window):
    """
    Validate common preprocessing inputs.

    Parameters
    ----------
    accel_signal : np.ndarray
        Expected to be either:
        - shape (n_samples, 3) for one accelerometer, or
        - shape (n_sensors, n_samples, 3) for multiple accelerometers.

    window : int
        Window length requested for preprocessing.

    Returns
    -------
    np.ndarray
        The validated signal converted to float.
    """
    accel_signal = np.asarray(accel_signal, dtype=float)

    if accel_signal.ndim not in (2, 3):
        raise ValueError(
            "accel_signal must have shape (n_samples, 3) or (n_sensors, n_samples, 3)"
        )

    if accel_signal.shape[-1] != 3:
        raise ValueError("The last dimension of accel_signal must have size 3 for x, y, z")

    if window < 1:
        raise ValueError("window must be >= 1")

    return accel_signal



def preprocess_accelerometer(accel_signal, method="moving_average", window=3):
    """
    Apply light preprocessing to accelerometer data.

    Parameters
    ----------
    accel_signal : array-like
        Accelerometer input data.

        Supported shapes:
        - (n_samples, 3): one accelerometer with x/y/z columns
        - (n_sensors, n_samples, 3): multiple accelerometers

        How it is used:
        Each axis is filtered independently. For example, x is smoothed using only
        x values, y using only y values, and z using only z values.

    method : {"moving_average", "median", "none"}, default="moving_average"
        Preprocessing method to apply.

        Meaning of each option:
        - "moving_average": good for light smoothing of ordinary noise.
        - "median": good when you expect occasional sharp spikes/outliers.
        - "none": returns an unchanged copy of the input.

    window : int, default=3
        Filter window length in samples.

        Important:
        This is measured in samples, not seconds. So if sampling_rate = 10 Hz and
        window = 3, then the smoothing uses 0.3 seconds of data.

    Returns
    -------
    np.ndarray
        Preprocessed signal with the same shape as the input.

    Examples
    --------
    Single sensor:
        input shape  -> (600, 3)
        output shape -> (600, 3)

    Three sensors:
        input shape  -> (3, 600, 3)
        output shape -> (3, 600, 3)
    """
    accel_signal = _validate_preprocess_inputs(accel_signal, window)

    if method not in {"moving_average", "median", "none"}:
        raise ValueError("method must be 'moving_average', 'median', or 'none'")

    if method == "none" or window == 1:
        return accel_signal.copy()

    processed = np.empty_like(accel_signal, dtype=float)

    if accel_signal.ndim == 2:
        # Single accelerometer: shape (n_samples, 3)
        for axis in range(3):
            axis_signal = accel_signal[:, axis]
            if method == "moving_average":
                processed[:, axis] = moving_average_1d(axis_signal, window=window)
            else:
                processed[:, axis] = median_filter_1d(axis_signal, window=window)
    else:
        # Multiple accelerometers: shape (n_sensors, n_samples, 3)
        for sensor_idx in range(accel_signal.shape[0]):
            for axis in range(3):
                axis_signal = accel_signal[sensor_idx, :, axis]
                if method == "moving_average":
                    processed[sensor_idx, :, axis] = moving_average_1d(axis_signal, window=window)
                else:
                    processed[sensor_idx, :, axis] = median_filter_1d(axis_signal, window=window)

    return processed
