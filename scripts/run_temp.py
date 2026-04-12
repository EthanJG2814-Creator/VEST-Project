import numpy as np

from src.temperature.pipeline import process_temperature


"""
Convenience entry point for running the temperature pipeline.

This wrapper mainly does three things:
1. Accepts either a backend-style payload dictionary or direct function arguments.
2. Validates and lightly describes the provided input at a high level.
3. Calls the core pipeline and prints a readable summary for each temperature sensor.

It is intentionally separate from the core pipeline so that:
- the pipeline can stay focused on computation and returning structured results,
- while this file can handle app/backend input parsing and user-facing printing/logging.
"""


def _describe_input(temp_arr):
    """
    Build a readable description of the temperature input shape.

    Parameters
    ----------
    temp_arr : np.ndarray
        Input temperature array after conversion to NumPy.

    Returns
    -------
    str
        Human-readable description of the input structure.
    """
    if temp_arr.ndim == 1:
        return f"Single temperature sensor with {temp_arr.shape[0]} samples"

    if temp_arr.ndim == 2:
        return f"{temp_arr.shape[0]} temperature sensors with {temp_arr.shape[1]} samples each"

    return f"Input shape: {temp_arr.shape}"


def _extract_payload_values(payload):
    """
    Extract temperature data and settings from a backend-style payload.

    Expected payload format
    -----------------------
    {
        "min_temp": 60.0,
        "max_temp": 120.0,
        "hampel_window": 7,
        "hampel_n_sigma": 3.0,
        "ema_alpha": 0.2,
        "calibration_scale": 1.0,
        "calibration_offset": -3.31,
        "temperatures": {
            "sensor_1": [t1, t2, t3, ...],
            "sensor_2": [t1, t2, t3, ...],
            ...
        }
    }

    Parameters
    ----------
    payload : dict
        Dictionary received from the app/backend layer.

    Returns
    -------
    tuple
        Parsed values in the order expected by ``main``.

    Notes
    -----
    Only ``temperatures`` is required. All processing settings can be omitted,
    in which case the defaults from ``main`` are used.
    """
    if not isinstance(payload, dict):
        raise ValueError("payload must be a dictionary")

    if "temperatures" not in payload:
        raise ValueError("payload must contain a 'temperatures' field")

    temp_signal = payload["temperatures"]
    min_temp = payload.get("min_temp", 60.0)
    max_temp = payload.get("max_temp", 120.0)
    hampel_window = payload.get("hampel_window", 7)
    hampel_n_sigma = payload.get("hampel_n_sigma", 3.0)
    ema_alpha = payload.get("ema_alpha", 0.2)
    calibration_scale = payload.get("calibration_scale", 1.0)
    calibration_offset = payload.get("calibration_offset", 0.0)

    return (
        temp_signal,
        min_temp,
        max_temp,
        hampel_window,
        hampel_n_sigma,
        ema_alpha,
        calibration_scale,
        calibration_offset,
    )


def main(
    payload=None,
    temp_signal=None,
    min_temp=60.0,
    max_temp=120.0,
    hampel_window=7,
    hampel_n_sigma=3.0,
    ema_alpha=0.2,
    calibration_scale=1.0,
    calibration_offset=0.0,
):
    """
    Run the temperature pipeline and print a summary.

    This function supports two input styles:

    1. Payload style (recommended for the backend/app)
       Pass a dictionary through ``payload``. The function will read the sensor
       data and settings from that dictionary.

    2. Direct-argument style (convenient for local testing)
       Pass ``temp_signal`` and any desired settings directly.

    Parameters
    ----------
    payload : dict or None, default=None
        Optional backend-style payload. If provided, it takes priority over the
        direct argument values.

        Expected keys
        -------------
        - "temperatures" : required
            Sensor data in any input format supported by ``process_temperature``.
            The most readable backend format is usually a dictionary mapping
            sensor names to 1D arrays/lists.
        - "min_temp" : optional
        - "max_temp" : optional
        - "hampel_window" : optional
        - "hampel_n_sigma" : optional
        - "ema_alpha" : optional
        - "calibration_scale" : optional
        - "calibration_offset" : optional

    temp_signal : array-like, list, tuple, or dict, default=None
        Temperature data to analyze when not using ``payload``.

        Supported formats:
        - Single sensor: shape (n_samples,)
        - Multiple sensors: shape (n_sensors, n_samples)
        - List/tuple of sensor arrays, each shape (n_samples,)
        - Dict mapping names to sensor arrays, each shape (n_samples,)

    min_temp : float, default=60.0
        Minimum raw value allowed before the range check marks it invalid.

    max_temp : float, default=120.0
        Maximum raw value allowed before the range check marks it invalid.

    hampel_window : int, default=7
        Centered window length for Hampel outlier replacement.

    hampel_n_sigma : float, default=3.0
        Threshold for Hampel outlier detection.

    ema_alpha : float, default=0.2
        Smoothing factor for the exponential moving average.

    calibration_scale : float, default=1.0
        Placeholder linear calibration scale.

    calibration_offset : float, default=0.0
        Placeholder linear calibration offset.

    Returns
    -------
    dict
        The structured output from ``process_temperature``.

    Notes
    -----
    This wrapper does not hard-code the number of sensors. If you pass 1,
    it processes 1. If you pass 3, it processes 3. If you pass more, it processes
    all of them as long as they follow a supported input format.
    """
    if payload is not None:
        (
            temp_signal,
            min_temp,
            max_temp,
            hampel_window,
            hampel_n_sigma,
            ema_alpha,
            calibration_scale,
            calibration_offset,
        ) = _extract_payload_values(payload)

    if temp_signal is None:
        raise ValueError("No temperature signal provided")

    if isinstance(temp_signal, dict):
        print(f"Received {len(temp_signal)} named temperature signals: {list(temp_signal.keys())}")
    else:
        try:
            temp_arr = np.asarray(temp_signal, dtype=float)
            print(_describe_input(temp_arr))
        except (TypeError, ValueError):
            print("Received non-uniform temperature input; pipeline will normalize it internally")

    out = process_temperature(
        temp_signal=temp_signal,
        min_temp=min_temp,
        max_temp=max_temp,
        hampel_window=hampel_window,
        hampel_n_sigma=hampel_n_sigma,
        ema_alpha=ema_alpha,
        calibration_scale=calibration_scale,
        calibration_offset=calibration_offset,
    )

    print("\nTemperature pipeline summary")
    print("-" * 40)
    print(f"Number of sensors received: {out['num_sensors_received']}")
    print(f"Number of sensors processed: {out['num_sensors_processed']}")
    print(f"Min allowed temperature: {out['settings']['min_temp']}")
    print(f"Max allowed temperature: {out['settings']['max_temp']}")
    print(f"Hampel window: {out['settings']['hampel_window']}")
    print(f"Hampel threshold: {out['settings']['hampel_n_sigma']}")
    print(f"EMA alpha: {out['settings']['ema_alpha']}")
    print(f"Calibration scale: {out['settings']['calibration_scale']}")
    print(f"Calibration offset: {out['settings']['calibration_offset']}\n")

    if out.get("global_warnings"):
        print("Global warnings:")
        for warning in out["global_warnings"]:
            print(f"  - {warning}")
        print()

    for sensor_name in out["sensor_names"]:
        sensor_out = out["per_sensor"][sensor_name]
        print(f"{sensor_name}:")
        print(f"  Usable: {sensor_out['usable']}")
        print(f"  Preprocessed mean: {sensor_out['preprocessed_mean']:.3f}")
        print(f"  Preprocessed median: {sensor_out['preprocessed_median']:.3f}")
        print(
            f"  Preprocessed min/max: "
            f"{sensor_out['preprocessed_min']:.3f}, {sensor_out['preprocessed_max']:.3f}"
        )
        print(f"  Calibrated mean: {sensor_out['calibrated_mean']:.3f}")
        print(f"  Calibrated median: {sensor_out['calibrated_median']:.3f}")
        print(
            f"  Calibrated min/max: "
            f"{sensor_out['calibrated_min']:.3f}, {sensor_out['calibrated_max']:.3f}"
        )
        print(f"  Missing fraction before repair: {sensor_out['quality']['missing_fraction']:.3f}")
        print(f"  Samples repaired: {sensor_out['quality']['samples_repaired']}")
        print(f"  Original length: {sensor_out['quality']['original_num_samples']}")
        print(f"  Final used length: {sensor_out['quality']['used_num_samples']}")
        print(f"  Was trimmed: {sensor_out['quality']['was_trimmed']}")

        if sensor_out["warnings"]:
            print("  Warnings:")
            for warning in sensor_out["warnings"]:
                print(f"    - {warning}")

        print()

    if out.get("dropped_sensors"):
        print("Dropped sensors:")
        for sensor_name, sensor_out in out["dropped_sensors"].items():
            print(f"  {sensor_name}:")
            for warning in sensor_out["warnings"]:
                print(f"    - {warning}")
        print()

    return out