from src.accelerometer.pipeline import process_accelerometer
import numpy as np


"""
Convenience entry point for running the accelerometer pipeline.

This wrapper mainly does three things:
1. Accepts either a backend-style payload dictionary or direct function arguments.
2. Validates and lightly describes the provided input at a high level.
3. Calls the core pipeline and prints a readable summary for each accelerometer.

It is intentionally separate from the core pipeline so that:
- the pipeline can stay focused on computation and returning structured results,
- while this file can handle app/backend input parsing and user-facing printing/logging.
"""


def _describe_input(accel_arr):
    """
    Build a readable description of the accelerometer input shape.

    Parameters
    ----------
    accel_arr : np.ndarray
        Input accelerometer array after conversion to NumPy.

    Returns
    -------
    str
        Human-readable description of the input structure.
    """
    if accel_arr.ndim == 2 and accel_arr.shape[1] == 3:
        return f"Single accelerometer with {accel_arr.shape[0]} samples and 3 axes"

    if accel_arr.ndim == 3 and accel_arr.shape[-1] == 3:
        return (
            f"{accel_arr.shape[0]} accelerometers with {accel_arr.shape[1]} samples each "
            f"and 3 axes per sample"
        )

    return f"Input shape: {accel_arr.shape}"



def _extract_payload_values(payload):
    """
    Extract accelerometer data and settings from a backend-style payload.

    Expected payload format
    -----------------------
    {
        "sampling_rate": 6,
        "second_threshold": 0.0169,
        "active_fraction_required": 0.25,
        "preprocess_method": "moving_average",
        "preprocess_window": 3,
        "accelerometers": {
            "sensor_1": [[ax, ay, az], [ax, ay, az], ...],
            "sensor_2": [[ax, ay, az], [ax, ay, az], ...],
            "sensor_3": [[ax, ay, az], [ax, ay, az], ...]
        }
    }

    Parameters
    ----------
    payload : dict
        Dictionary received from the app/backend layer.

    Returns
    -------
    tuple
        Tuple containing the parsed values in the order expected by ``main``:
        ``accel_signal, sampling_rate, second_threshold,
        active_fraction_required, preprocess_method, preprocess_window``.

    Notes
    -----
    Only ``accelerometers`` is required. All processing settings can be omitted,
    in which case the defaults from ``main`` are used.
    """
    if not isinstance(payload, dict):
        raise ValueError("payload must be a dictionary")

    if "accelerometers" not in payload:
        raise ValueError("payload must contain an 'accelerometers' field")

    accel_signal = payload["accelerometers"]
    sampling_rate = payload.get("sampling_rate", 6)
    second_threshold = payload.get("second_threshold", 0.0169)
    active_fraction_required = payload.get("active_fraction_required", 0.25)
    preprocess_method = payload.get("preprocess_method", "moving_average")
    preprocess_window = payload.get("preprocess_window", 3)

    return (
        accel_signal,
        sampling_rate,
        second_threshold,
        active_fraction_required,
        preprocess_method,
        preprocess_window,
    )



def main(
    payload=None,
    accel_signal=None,
    sampling_rate=6,
    second_threshold=0.0169,
    active_fraction_required=0.25,
    preprocess_method="moving_average",
    preprocess_window=3,
):
    """
    Run the accelerometer pipeline and print a summary.

    This function supports two input styles:

    1. Payload style (recommended for the backend/app)
       Pass a dictionary through ``payload``. The function will read the sensor
       data and settings from that dictionary.

    2. Direct-argument style (convenient for local testing)
       Pass ``accel_signal`` and any desired settings directly.

    Parameters
    ----------
    payload : dict or None, default=None
        Optional backend-style payload. If provided, it takes priority over the
        direct argument values.

        Expected keys
        -------------
        - "accelerometers" : required
            Sensor data in any input format supported by ``process_accelerometer``.
            The most readable backend format is usually a dictionary mapping
            sensor names to arrays/lists of shape ``(n_samples, 3)``.
        - "sampling_rate" : optional
        - "second_threshold" : optional
        - "active_fraction_required" : optional
        - "preprocess_method" : optional
        - "preprocess_window" : optional

    accel_signal : array-like, list, tuple, or dict, default=None
        Accelerometer data to analyze when not using ``payload``.

        Supported formats:
        - Single sensor: shape (n_samples, 3)
        - Multiple sensors: shape (n_sensors, n_samples, 3)
        - List/tuple of sensor arrays, each shape (n_samples, 3)
        - Dict mapping names to sensor arrays, each shape (n_samples, 3)

    sampling_rate : int, default=6
        Number of samples per second in the input data.

    second_threshold : float, default=0.0169
        Threshold used to decide whether a 1-second window is active.

    active_fraction_required : float, default=0.25
        Fraction of analyzed seconds that must be active for a sensor to receive
        the final label "active".

    preprocess_method : {"moving_average", "median", "none"}, default="moving_average"
        Preprocessing method applied before magnitude computation.

    preprocess_window : int, default=3
        Window length in samples used by the selected preprocessing method.

    Returns
    -------
    dict
        The structured output from ``process_accelerometer``.

    Notes
    -----
    This wrapper does not hard-code the number of accelerometers. If you pass 1,
    it processes 1. If you pass 3, it processes 3. If you pass more, it processes
    all of them as long as they follow a supported input format.

    The core pipeline is designed to be fault-tolerant for real-world use. Small
    issues such as short missing segments or slightly different sensor lengths are
    repaired or trimmed when possible, and warnings/quality information are
    returned in the output instead of immediately crashing.
    """
    if payload is not None:
        (
            accel_signal,
            sampling_rate,
            second_threshold,
            active_fraction_required,
            preprocess_method,
            preprocess_window,
        ) = _extract_payload_values(payload)

    if accel_signal is None:
        raise ValueError("No accelerometer signal provided")

    # We only convert here for display purposes when it is straightforward to do so.
    # The pipeline itself performs the real normalization, cleaning, and validation.
    if isinstance(accel_signal, dict):
        print(f"Received {len(accel_signal)} named accelerometer signals: {list(accel_signal.keys())}")
    else:
        try:
            accel_arr = np.asarray(accel_signal, dtype=float)
            print(_describe_input(accel_arr))
        except (TypeError, ValueError):
            print("Received non-uniform accelerometer input; pipeline will normalize it internally")

    out = process_accelerometer(
        accel_signal=accel_signal,
        sampling_rate=sampling_rate,
        second_threshold=second_threshold,
        active_fraction_required=active_fraction_required,
        preprocess_method=preprocess_method,
        preprocess_window=preprocess_window,
    )

    print("\nAccelerometer pipeline summary")
    print("-" * 40)
    print(f"Number of sensors received: {out['num_sensors_received']}")
    print(f"Number of sensors processed: {out['num_sensors_processed']}")
    print(f"Sampling rate: {out['settings']['sampling_rate']} Hz")
    print(f"Per-second activity threshold: {out['settings']['second_threshold']}")
    print(f"Required active fraction for final label: {out['settings']['active_fraction_required']}")
    print(f"Preprocessing method: {out['settings']['preprocess_method']}")
    print(f"Preprocessing window: {out['settings']['preprocess_window']} samples\n")

    if out.get("global_warnings"):
        print("Global warnings:")
        for warning in out["global_warnings"]:
            print(f"  - {warning}")
        print()

    for sensor_name in out["sensor_names"]:
        sensor_out = out["per_sensor"][sensor_name]
        print(f"{sensor_name}:")
        print(f"  Final label: {sensor_out['label']}")
        print(f"  Usable: {sensor_out['usable']}")
        print(
            f"  Active seconds: {sensor_out['active_seconds']} "
            f"out of {sensor_out['num_seconds_used']} full seconds"
        )
        print(f"  Active fraction: {sensor_out['active_fraction']:.3f}")
        print(f"  Mean second score: {np.mean(sensor_out['second_scores']):.6f}")
        print(f"  Missing fraction before repair: {sensor_out['quality']['missing_fraction']:.3f}")
        print(f"  Rows repaired: {sensor_out['quality']['rows_repaired']}")
        print(f"  Original length: {sensor_out['quality']['original_num_samples']}")
        print(f"  Final used length: {sensor_out['quality']['used_num_samples']}")
        print(f"  Was trimmed: {sensor_out['quality']['was_trimmed']}")

        if sensor_out["warnings"]:
            print("  Warnings:")
            for warning in sensor_out["warnings"]:
                print(f"    - {warning}")

        print(f"  Second scores: {sensor_out['second_scores']}")
        print(f"  Second labels: {sensor_out['second_labels']}\n")

    return out
