import numpy as np


"""
Preprocessing utilities for temperature signals.

Design goals
------------
1. Keep preprocessing lightweight and practical for wearable temperature data.
2. Focus on the main real-world problems:
   - invalid readings,
   - short spikes from motion/contact changes,
   - small jitter/noise.
3. Support either one temperature sensor or multiple temperature sensors.
4. Keep output shapes identical to input shapes so downstream code can rely on a
   stable interface.

Supported input shapes
----------------------
- (n_samples,) for one temperature sensor
- (n_sensors, n_samples) for multiple temperature sensors
"""


def range_check_1d(signal, min_temp=60.0, max_temp=120.0):
    """
    Replace out-of-range temperature values with NaN.

    Parameters
    ----------
    signal : array-like of shape (n_samples,)
        One temperature signal.

    min_temp : float, default=60.0
        Minimum allowed raw temperature.

    max_temp : float, default=120.0
        Maximum allowed raw temperature.

    Returns
    -------
    np.ndarray
        Copy of the signal where out-of-range values are replaced with NaN.

    Why this helps
    --------------
    Wearable sensors can occasionally produce impossible values due to bad
    contact, startup issues, electrical glitches, or transmission errors.
    Marking those values as NaN lets later steps repair them more safely.
    """
    signal = np.asarray(signal, dtype=float)

    if signal.ndim != 1:
        raise ValueError("signal must be 1D")

    out = signal.copy()
    invalid_mask = (out < min_temp) | (out > max_temp)
    out[invalid_mask] = np.nan
    return out


def fill_nans_1d(signal):
    """
    Fill NaN or non-finite values in a 1D signal by linear interpolation.

    Parameters
    ----------
    signal : array-like of shape (n_samples,)
        One temperature signal that may contain NaNs or infinite values.

    Returns
    -------
    np.ndarray
        Signal with missing values filled by interpolation. Edge gaps are filled
        using the nearest valid value.

    Notes
    -----
    This is mainly used after range checking or invalid-value repair so the later
    filtering steps can run on a complete signal.
    """
    signal = np.asarray(signal, dtype=float)

    if signal.ndim != 1:
        raise ValueError("signal must be 1D")

    out = signal.copy()
    n = len(out)

    if n == 0:
        return out

    invalid_mask = ~np.isfinite(out)
    if not np.any(invalid_mask):
        return out

    valid_mask = np.isfinite(out)
    if not np.any(valid_mask):
        raise ValueError("signal contains no valid values")

    x = np.arange(n)
    out[invalid_mask] = np.interp(x[invalid_mask], x[valid_mask], out[valid_mask])
    return out


def hampel_filter_1d(signal, window=7, n_sigma=3.0):
    """
    Replace local outliers using a Hampel filter.

    Parameters
    ----------
    signal : array-like of shape (n_samples,)
        One temperature signal.

    window : int, default=7
        Number of samples in the local window. A value around 7 works well for
        1 Hz data because it uses about 7 seconds of local context.

    n_sigma : float, default=3.0
        Outlier threshold in MAD-based sigma equivalents.

    Returns
    -------
    np.ndarray
        Filtered signal where detected outliers are replaced with the local
        median.

    How it works
    ------------
    For each sample:
    1. Look at a local window around that sample.
    2. Compute the local median.
    3. Compute the local MAD (median absolute deviation).
    4. Flag the sample as an outlier if it is too far from the local median.
    5. Replace flagged samples with the local median.

    Why this helps
    --------------
    A Hampel filter is robust to short spikes and contact artifacts. This is
    usually better than a moving average alone because averages can be pulled by
    outliers.
    """
    signal = np.asarray(signal, dtype=float)

    if signal.ndim != 1:
        raise ValueError("signal must be 1D")

    if window < 1:
        raise ValueError("window must be >= 1")

    if window % 2 == 0:
        raise ValueError("window must be odd for a centered Hampel filter")

    if len(signal) == 0:
        return signal.copy()

    out = signal.copy()
    half_window = window // 2

    for i in range(len(signal)):
        start = max(0, i - half_window)
        end = min(len(signal), i + half_window + 1)
        local = signal[start:end]

        local_median = np.median(local)
        mad = np.median(np.abs(local - local_median))
        sigma_est = 1.4826 * mad

        if sigma_est == 0:
            continue

        if abs(signal[i] - local_median) > n_sigma * sigma_est:
            out[i] = local_median

    return out


def ema_1d(signal, alpha=0.2):
    """
    Smooth a 1D signal with an exponential moving average (EMA).

    Parameters
    ----------
    signal : array-like of shape (n_samples,)
        One temperature signal.

    alpha : float, default=0.2
        EMA smoothing factor. Must satisfy 0 < alpha <= 1.

        Interpretation:
        - smaller alpha -> smoother output, slower response
        - larger alpha -> less smoothing, faster response

    Returns
    -------
    np.ndarray
        Smoothed signal with the same length as the input.

    Why this helps
    --------------
    EMA is simple and firmware-friendly. It reduces small jitter while still
    following gradual temperature trends over time.
    """
    signal = np.asarray(signal, dtype=float)

    if signal.ndim != 1:
        raise ValueError("signal must be 1D")

    if not (0 < alpha <= 1):
        raise ValueError("alpha must be in the interval (0, 1]")

    if len(signal) == 0:
        return signal.copy()

    out = np.empty_like(signal, dtype=float)
    out[0] = signal[0]

    for i in range(1, len(signal)):
        out[i] = alpha * signal[i] + (1 - alpha) * out[i - 1]

    return out


def _validate_preprocess_inputs(temp_signal, window, alpha):
    """
    Validate common preprocessing inputs.

    Parameters
    ----------
    temp_signal : np.ndarray
        Expected to be either:
        - shape (n_samples,) for one sensor, or
        - shape (n_sensors, n_samples) for multiple sensors.

    window : int
        Hampel window length.

    alpha : float
        EMA smoothing factor.

    Returns
    -------
    np.ndarray
        The validated signal converted to float.
    """
    temp_signal = np.asarray(temp_signal, dtype=float)

    if temp_signal.ndim not in (1, 2):
        raise ValueError(
            "temp_signal must have shape (n_samples,) or (n_sensors, n_samples)"
        )

    if window < 1:
        raise ValueError("hampel_window must be >= 1")

    if window % 2 == 0:
        raise ValueError("hampel_window must be odd")

    if not (0 < alpha <= 1):
        raise ValueError("ema_alpha must be in the interval (0, 1]")

    return temp_signal


def preprocess_temperature(
    temp_signal,
    min_temp=60.0,
    max_temp=120.0,
    hampel_window=7,
    hampel_n_sigma=3.0,
    ema_alpha=0.2,
):
    """
    Apply the main preprocessing pipeline to temperature data.

    Parameters
    ----------
    temp_signal : array-like
        Temperature input data.

        Supported shapes:
        - (n_samples,) for one temperature sensor
        - (n_sensors, n_samples) for multiple temperature sensors

    min_temp : float, default=60.0
        Minimum raw temperature allowed before range check marks it invalid.

    max_temp : float, default=120.0
        Maximum raw temperature allowed before range check marks it invalid.

    hampel_window : int, default=7
        Centered window length for Hampel outlier replacement.

    hampel_n_sigma : float, default=3.0
        Threshold for Hampel outlier detection.

    ema_alpha : float, default=0.2
        Smoothing factor for the exponential moving average.

    Returns
    -------
    np.ndarray
        Preprocessed signal with the same shape as the input.

    Pipeline
    --------
    For each sensor:
    1. Range check
    2. Fill NaNs created by invalid values or range check
    3. Hampel outlier replacement
    4. EMA smoothing
    """
    temp_signal = _validate_preprocess_inputs(temp_signal, hampel_window, ema_alpha)

    if temp_signal.ndim == 1:
        checked = range_check_1d(temp_signal, min_temp=min_temp, max_temp=max_temp)
        filled = fill_nans_1d(checked)
        filtered = hampel_filter_1d(
            filled,
            window=hampel_window,
            n_sigma=hampel_n_sigma,
        )
        smoothed = ema_1d(filtered, alpha=ema_alpha)
        return smoothed

    processed = np.empty_like(temp_signal, dtype=float)

    for sensor_idx in range(temp_signal.shape[0]):
        checked = range_check_1d(
            temp_signal[sensor_idx],
            min_temp=min_temp,
            max_temp=max_temp,
        )
        filled = fill_nans_1d(checked)
        filtered = hampel_filter_1d(
            filled,
            window=hampel_window,
            n_sigma=hampel_n_sigma,
        )
        smoothed = ema_1d(filtered, alpha=ema_alpha)
        processed[sensor_idx] = smoothed

    return processed