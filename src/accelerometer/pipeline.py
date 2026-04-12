import numpy as np

from src.accelerometer.preprocessing import preprocess_accelerometer
from src.accelerometer.analysis import compute_magnitude, analyze_accelerometer


"""
Core accelerometer pipeline.

This module is responsible for taking raw accelerometer input, preprocessing it,
computing magnitude, scoring second-by-second motion, and assigning a final
active/inactive label.

New behavior in this version
----------------------------
This version supports either:
1. One accelerometer: shape (n_samples, 3)
2. Multiple accelerometers: shape (n_sensors, n_samples, 3)
3. Named sensor payloads passed in as a dictionary

It returns a separate result dictionary for each accelerometer, plus an overall
container that keeps the results organized.

For backend robustness, this version also tolerates some real-world data issues:
- short missing segments are repaired by interpolation,
- sensors with different lengths are trimmed to a common shortest usable length,
- sensors with too much invalid data are marked unusable and skipped.
"""


# These thresholds are intentionally conservative and can be tuned later if needed.
MAX_MISSING_FRACTION_FOR_USABLE = 0.20
WARNING_MISSING_FRACTION = 0.05



def _coerce_single_sensor_array(sensor):
    """
    Convert one sensor input into a float NumPy array with shape (n_samples, 3).

    Parameters
    ----------
    sensor : array-like
        One accelerometer signal. Expected to represent rows of [x, y, z] samples.

    Returns
    -------
    np.ndarray
        Array with shape (n_samples, 3).

    Why this helper exists
    ----------------------
    Many user-facing formats are Python lists rather than prebuilt NumPy arrays.
    This helper centralizes the conversion and gives a clear error message if the
    provided data does not actually look like one accelerometer.
    """
    sensor = np.asarray(sensor, dtype=float)

    if sensor.ndim != 2 or sensor.shape[1] != 3:
        raise ValueError("Each sensor array must have shape (n_samples, 3)")

    return sensor



def _normalize_multi_sensor_input(accel_signal):
    """
    Normalize supported input formats into a consistent multi-sensor representation.

    Parameters
    ----------
    accel_signal : array-like, list, tuple, or dict
        Supported formats:

        1. Single sensor array of shape (n_samples, 3)
           -> interpreted as one accelerometer.

        2. Multi-sensor array of shape (n_sensors, n_samples, 3)
           -> interpreted directly.

        3. List/tuple of sensor arrays, where each element has shape (n_samples, 3)
           -> sensors are stacked in the order provided.

        4. Dict mapping sensor names to arrays of shape (n_samples, 3)
           -> values are stacked, and keys are preserved as sensor names.

        5. Plain Python list of rows shaped like [[x, y, z], [x, y, z], ...]
           -> interpreted as one accelerometer.

    Returns
    -------
    tuple
        sensor_arrays : list of np.ndarray
            One array per sensor, each with shape (n_samples, 3).

        sensor_names : list of str
            Names associated with each sensor.

        original_was_single : bool
            True if the original input represented exactly one sensor.

    Why this helper exists
    ----------------------
    It keeps the rest of the pipeline simple. Downstream code can assume that it
    is always working with a list of per-sensor arrays plus a list of names,
    regardless of how the user provided the data.
    """
    original_was_single = False

    if isinstance(accel_signal, dict):
        if not accel_signal:
            raise ValueError("accel_signal dictionary cannot be empty")

        sensor_names = list(accel_signal.keys())
        sensor_arrays = [_coerce_single_sensor_array(accel_signal[name]) for name in sensor_names]
        return sensor_arrays, sensor_names, False

    if isinstance(accel_signal, (list, tuple)):
        if len(accel_signal) == 0:
            raise ValueError("accel_signal list/tuple cannot be empty")

        try:
            accel_arr = np.asarray(accel_signal, dtype=float)

            if accel_arr.ndim == 2 and accel_arr.shape[1] == 3:
                original_was_single = True
                return [accel_arr], ["sensor_1"], original_was_single

            if accel_arr.ndim == 3 and accel_arr.shape[-1] == 3:
                sensor_names = [f"sensor_{i + 1}" for i in range(accel_arr.shape[0])]
                sensor_arrays = [accel_arr[i].astype(float) for i in range(accel_arr.shape[0])]
                return sensor_arrays, sensor_names, False
        except ValueError:
            pass

        sensor_names = [f"sensor_{i + 1}" for i in range(len(accel_signal))]
        sensor_arrays = [_coerce_single_sensor_array(sensor) for sensor in accel_signal]
        return sensor_arrays, sensor_names, False

    accel_arr = np.asarray(accel_signal, dtype=float)

    if accel_arr.ndim == 2 and accel_arr.shape[1] == 3:
        original_was_single = True
        return [accel_arr], ["sensor_1"], original_was_single

    if accel_arr.ndim == 3 and accel_arr.shape[-1] == 3:
        sensor_names = [f"sensor_{i + 1}" for i in range(accel_arr.shape[0])]
        sensor_arrays = [accel_arr[i].astype(float) for i in range(accel_arr.shape[0])]
        return sensor_arrays, sensor_names, False

    raise ValueError(
        "accel_signal must be one of the following: "
        "(n_samples, 3), (n_sensors, n_samples, 3), a list/tuple of (n_samples, 3) arrays, "
        "or a dict of named (n_samples, 3) arrays"
    )



def _repair_sensor_data(sensor, sensor_name):
    """
    Repair a single sensor array by interpolating invalid samples when possible.

    Parameters
    ----------
    sensor : np.ndarray of shape (n_samples, 3)
        One accelerometer signal.

    sensor_name : str
        Name of the sensor, used in warning messages.

    Returns
    -------
    dict
        Contains:
        - "usable": whether the sensor remains usable after validation/repair
        - "repaired": repaired float array if usable, otherwise None
        - "quality": quality metadata for the sensor
        - "warnings": list of warning strings

    Repair policy
    -------------
    - A row is considered invalid if any axis is NaN or infinite.
    - Invalid rows are repaired by linear interpolation independently per axis.
    - Edge gaps are filled by extending the nearest valid value.
    - If more than MAX_MISSING_FRACTION_FOR_USABLE of rows are invalid, the sensor
      is marked unusable rather than trusted.
    """
    sensor = np.asarray(sensor, dtype=float)
    warnings = []
    n_samples = int(sensor.shape[0])

    # A row is invalid if any of its x/y/z values is NaN or non-finite.
    invalid_rows = ~np.all(np.isfinite(sensor), axis=1)
    num_invalid_rows = int(np.sum(invalid_rows))
    missing_fraction = 0.0 if n_samples == 0 else num_invalid_rows / n_samples

    quality = {
        "original_num_samples": n_samples,
        "used_num_samples": n_samples,
        "num_invalid_rows": num_invalid_rows,
        "rows_repaired": num_invalid_rows,
        "missing_fraction": float(missing_fraction),
        "was_trimmed": False,
        "trimmed_from": n_samples,
        "repair_method": "interpolation",
    }

    if n_samples == 0:
        warnings.append(f"{sensor_name} has zero samples and cannot be processed")
        return {
            "usable": False,
            "repaired": None,
            "quality": quality,
            "warnings": warnings,
        }

    if num_invalid_rows == 0:
        return {
            "usable": True,
            "repaired": sensor.copy(),
            "quality": quality,
            "warnings": warnings,
        }

    if num_invalid_rows == n_samples:
        warnings.append(f"{sensor_name} contains no valid rows and was marked unusable")
        return {
            "usable": False,
            "repaired": None,
            "quality": quality,
            "warnings": warnings,
        }

    if missing_fraction > WARNING_MISSING_FRACTION:
        warnings.append(
            f"{sensor_name} had {num_invalid_rows} invalid rows "
            f"({missing_fraction:.1%}) that required repair"
        )

    if missing_fraction > MAX_MISSING_FRACTION_FOR_USABLE:
        warnings.append(
            f"{sensor_name} exceeded the missing-data limit "
            f"({missing_fraction:.1%} > {MAX_MISSING_FRACTION_FOR_USABLE:.1%}) and was marked unusable"
        )
        return {
            "usable": False,
            "repaired": None,
            "quality": quality,
            "warnings": warnings,
        }

    repaired = sensor.copy()

    # Convert all invalid rows to NaN so each axis can be interpolated independently.
    repaired[invalid_rows, :] = np.nan
    sample_index = np.arange(n_samples)

    for axis in range(3):
        axis_values = repaired[:, axis]
        finite_mask = np.isfinite(axis_values)

        if not np.any(finite_mask):
            warnings.append(f"{sensor_name} axis {axis} had no valid values and was marked unusable")
            return {
                "usable": False,
                "repaired": None,
                "quality": quality,
                "warnings": warnings,
            }

        repaired[:, axis] = np.interp(
            sample_index,
            sample_index[finite_mask],
            axis_values[finite_mask],
        )

    return {
        "usable": True,
        "repaired": repaired,
        "quality": quality,
        "warnings": warnings,
    }



def _prepare_sensor_set(sensor_arrays, sensor_names):
    """
    Repair sensors, drop unusable ones, and trim usable ones to a common length.

    Parameters
    ----------
    sensor_arrays : list of np.ndarray
        Per-sensor arrays, each with shape (n_samples, 3).

    sensor_names : list of str
        Names corresponding to ``sensor_arrays``.

    Returns
    -------
    tuple
        usable_sensors : list of np.ndarray
            Cleaned and length-aligned sensor arrays.

        usable_names : list of str
            Names for the usable sensors.

        sensor_metadata : dict
            Per-sensor metadata keyed by sensor name.

        global_warnings : list of str
            Warnings that apply to the overall run rather than a single sensor.

    Why this helper exists
    ----------------------
    Real-world sensor streams are often imperfect. This helper isolates the logic
    for repairing small issues and establishing a consistent input length before
    the actual motion scoring begins.
    """
    sensor_metadata = {}
    global_warnings = []
    usable_entries = []

    for sensor_name, sensor in zip(sensor_names, sensor_arrays):
        repaired = _repair_sensor_data(sensor, sensor_name)
        sensor_metadata[sensor_name] = {
            "usable": repaired["usable"],
            "warnings": list(repaired["warnings"]),
            "quality": dict(repaired["quality"]),
            "original_raw": np.asarray(sensor, dtype=float),
        }

        if repaired["usable"]:
            usable_entries.append((sensor_name, repaired["repaired"]))

    if not usable_entries:
        raise ValueError("No usable accelerometer signals remain after data-quality checks")

    common_length = min(sensor.shape[0] for _, sensor in usable_entries)

    if len({sensor.shape[0] for _, sensor in usable_entries}) > 1:
        global_warnings.append(
            "Sensors had different lengths and were trimmed to the shortest usable length "
            f"({common_length} samples)"
        )

    usable_names = []
    usable_sensors = []

    for sensor_name, sensor in usable_entries:
        trimmed = sensor[:common_length].copy()
        usable_names.append(sensor_name)
        usable_sensors.append(trimmed)

        metadata = sensor_metadata[sensor_name]
        metadata["quality"]["used_num_samples"] = int(common_length)
        metadata["quality"]["was_trimmed"] = bool(metadata["quality"]["original_num_samples"] != common_length)

        if metadata["quality"]["was_trimmed"]:
            metadata["warnings"].append(
                f"{sensor_name} was trimmed from {metadata['quality']['original_num_samples']} "
                f"to {common_length} samples to match the other usable sensors"
            )

    return usable_sensors, usable_names, sensor_metadata, global_warnings



def process_accelerometer(
    accel_signal,
    sampling_rate=10,
    second_threshold=0.05,
    active_fraction_required=0.33,
    preprocess_method="moving_average",
    preprocess_window=3,
):
    """
    Run the full accelerometer pipeline on one or more sensors.

    Parameters
    ----------
    accel_signal : array-like, list, tuple, or dict
        Accelerometer data.

        Supported formats:
        - Single sensor: shape (n_samples, 3)
        - Multiple sensors: shape (n_sensors, n_samples, 3)
        - List/tuple of sensor arrays: each shape (n_samples, 3)
        - Dict of named sensor arrays: each shape (n_samples, 3)

    sampling_rate : int, default=10
        Number of samples per second.

        How it is used:
        - Determines how many samples belong to each 1-second window.
        - Also determines the minimum signal length needed to analyze at least one
          full second.

    second_threshold : float, default=0.05
        Threshold applied to each 1-second MAD score.

        Decision rule per second:
        - score > second_threshold  -> active second
        - score <= second_threshold -> inactive second

    active_fraction_required : float, default=0.33
        Fraction of analyzed seconds that must be active for the entire signal to
        receive the final label "active".

        Example:
        If 60 seconds are analyzed and active_fraction_required = 0.33, then at
        least 19.8 seconds worth of activity are required, which effectively means
        20 or more active seconds because the count is discrete.

    preprocess_method : {"moving_average", "median", "none"}, default="moving_average"
        Type of preprocessing applied before magnitude is computed.

    preprocess_window : int, default=3
        Window length in samples for preprocessing.

    Returns
    -------
    dict
        Structured pipeline output.

        Main keys:
        - "per_sensor": dict of per-sensor results
        - "sensor_names": list of sensor names in order
        - "settings": pipeline settings used for the run
        - "num_sensors": number of accelerometers processed
        - "num_sensors_received": number of accelerometers originally provided
        - "num_sensors_processed": number of accelerometers that were still usable
        - "global_warnings": warnings that apply to the overall run

        Each per-sensor result contains:
        - "label"
        - "usable"
        - "active_seconds"
        - "num_seconds_used"
        - "active_fraction"
        - "second_scores"
        - "second_labels"
        - "warnings"
        - "quality"
        - "raw"
        - "repaired"
        - "preprocessed"
        - "magnitude"

        Signal stages
        -------------
        - "raw" is the original per-sensor input before any repair.
        - "repaired" is the signal after invalid rows are interpolated and
          sensors are trimmed to a common usable length.
        - "preprocessed" is the repaired signal after smoothing.
        - "magnitude" is computed from the preprocessed signal and used for activity scoring.

        Labeling behavior
        -----------------
        The final "label" is assigned separately for each sensor. This pipeline
        does not combine multiple sensors into one overall activity label.

        For backward compatibility:
        If exactly one usable sensor was supplied and the original input was a
        single sensor, the returned dictionary also includes those per-sensor keys
        at the top level.
    """
    if sampling_rate <= 0:
        raise ValueError("sampling_rate must be positive")

    if not (0 <= active_fraction_required <= 1):
        raise ValueError("active_fraction_required must be between 0 and 1")

    sensor_arrays, sensor_names, original_was_single = _normalize_multi_sensor_input(accel_signal)
    num_sensors_received = len(sensor_names)

    usable_sensors, usable_names, sensor_metadata, global_warnings = _prepare_sensor_set(
        sensor_arrays,
        sensor_names,
    )

    # If after repair and trimming we still do not have enough samples for one full
    # second, the signal is too short to analyze meaningfully.
    if usable_sensors[0].shape[0] < sampling_rate:
        raise ValueError(
            f"Need at least {sampling_rate} samples to form one full second at {sampling_rate} Hz"
        )

    sensor_array = np.stack(usable_sensors, axis=0).astype(float)

    preprocessed = preprocess_accelerometer(
        sensor_array,
        method=preprocess_method,
        window=preprocess_window,
    )

    magnitude_array = compute_magnitude(preprocessed)

    per_sensor = {}

    for sensor_idx, sensor_name in enumerate(usable_names):
        sensor_magnitude = magnitude_array[sensor_idx]
        analysis = analyze_accelerometer(
            magnitude=sensor_magnitude,
            sampling_rate=sampling_rate,
            second_threshold=second_threshold,
        )

        n_full_seconds = analysis["num_seconds_used"]
        if n_full_seconds == 0:
            raise ValueError(f"No full 1-second windows available for {sensor_name}")

        active_fraction = analysis["active_seconds"] / n_full_seconds
        label = "active" if active_fraction >= active_fraction_required else "inactive"

        per_sensor[sensor_name] = {
            "label": label,
            "usable": True,
            "active_seconds": analysis["active_seconds"],
            "num_seconds_used": n_full_seconds,
            "active_fraction": float(active_fraction),
            "second_scores": analysis["second_scores"],
            "second_labels": analysis["second_labels"],
            "warnings": list(sensor_metadata[sensor_name]["warnings"]),
            "quality": dict(sensor_metadata[sensor_name]["quality"]),
            "raw": sensor_metadata[sensor_name]["original_raw"],
            "repaired": sensor_array[sensor_idx],
            "preprocessed": preprocessed[sensor_idx],
            "magnitude": sensor_magnitude,
        }

    result = {
        "per_sensor": per_sensor,
        "sensor_names": usable_names,
        "num_sensors": len(usable_names),
        "num_sensors_received": num_sensors_received,
        "num_sensors_processed": len(usable_names),
        "global_warnings": global_warnings,
        "settings": {
            "sampling_rate": sampling_rate,
            "second_threshold": second_threshold,
            "active_fraction_required": active_fraction_required,
            "preprocess_method": preprocess_method,
            "preprocess_window": preprocess_window,
        },
        "dropped_sensors": {
            name: {
                "usable": False,
                "warnings": list(sensor_metadata[name]["warnings"]),
                "quality": dict(sensor_metadata[name]["quality"]),
            }
            for name in sensor_names
            if not sensor_metadata[name]["usable"]
        },
    }

    # Preserve the original simple interface when only one sensor is supplied.
    # This makes it easier to keep older testing scripts working.
    if original_was_single and len(usable_names) == 1:
        result.update(per_sensor[usable_names[0]])

    return result
