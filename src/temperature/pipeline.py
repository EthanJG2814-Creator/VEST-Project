import numpy as np

from src.temperature.preprocessing import preprocess_temperature
from src.temperature.analysis import analyze_temperature


"""
Core temperature pipeline.

This module is responsible for taking raw temperature input, validating and
repairing it when possible, preprocessing each sensor, applying calibration, and
returning a structured per-sensor result.

Supported input styles
----------------------
1. One temperature sensor:
   shape (n_samples,)

2. Multiple temperature sensors:
   shape (n_sensors, n_samples)

3. Named sensor payloads passed in as a dictionary:
   {
       "sensor_1": [...],
       "sensor_2": [...],
       ...
   }

Backend robustness
------------------
This version tolerates common real-world issues:
- NaN or infinite samples,
- sensors with different lengths,
- partially missing data,
- empty or fully invalid sensors.

Usable sensors are repaired and trimmed to a common length when needed.
Completely unusable sensors are dropped and reported in the output.
"""


MAX_MISSING_FRACTION_FOR_USABLE = 0.25
WARNING_MISSING_FRACTION = 0.05


def _coerce_single_sensor_array(sensor):
    """
    Convert one sensor input into a float NumPy array with shape (n_samples,).

    Parameters
    ----------
    sensor : array-like
        One temperature signal.

    Returns
    -------
    np.ndarray
        Array with shape (n_samples,).

    Why this helper exists
    ----------------------
    Many user-facing formats are Python lists rather than prebuilt NumPy arrays.
    This helper centralizes the conversion and gives a clear error message if the
    provided data does not actually look like one temperature sensor.
    """
    sensor = np.asarray(sensor, dtype=float)

    if sensor.ndim != 1:
        raise ValueError("Each sensor array must have shape (n_samples,)")

    return sensor


def _normalize_multi_sensor_input(temp_signal):
    """
    Normalize supported input formats into a consistent multi-sensor representation.

    Parameters
    ----------
    temp_signal : array-like, list, tuple, or dict
        Supported formats:

        1. Single sensor array of shape (n_samples,)
           -> interpreted as one temperature sensor.

        2. Multi-sensor array of shape (n_sensors, n_samples)
           -> interpreted directly.

        3. List/tuple of sensor arrays, where each element has shape (n_samples,)
           -> sensors are stacked in the order provided.

        4. Dict mapping sensor names to arrays of shape (n_samples,)
           -> values are stacked, and keys are preserved as sensor names.

    Returns
    -------
    tuple
        sensor_arrays : list of np.ndarray
            One array per sensor, each with shape (n_samples,).

        sensor_names : list of str
            Names associated with each sensor.

        original_was_single : bool
            True if the original input represented exactly one sensor.
    """
    original_was_single = False

    if isinstance(temp_signal, dict):
        if not temp_signal:
            raise ValueError("temp_signal dictionary cannot be empty")

        sensor_names = list(temp_signal.keys())
        sensor_arrays = [_coerce_single_sensor_array(temp_signal[name]) for name in sensor_names]
        return sensor_arrays, sensor_names, False

    if isinstance(temp_signal, (list, tuple)):
        if len(temp_signal) == 0:
            raise ValueError("temp_signal list/tuple cannot be empty")

        try:
            temp_arr = np.asarray(temp_signal, dtype=float)
            if temp_arr.ndim == 1:
                original_was_single = True
                return [temp_arr], ["sensor_1"], original_was_single

            if temp_arr.ndim == 2:
                sensor_names = [f"sensor_{i + 1}" for i in range(temp_arr.shape[0])]
                sensor_arrays = [temp_arr[i].astype(float) for i in range(temp_arr.shape[0])]
                return sensor_arrays, sensor_names, False
        except ValueError:
            pass

        sensor_names = [f"sensor_{i + 1}" for i in range(len(temp_signal))]
        sensor_arrays = [_coerce_single_sensor_array(sensor) for sensor in temp_signal]
        return sensor_arrays, sensor_names, False

    temp_arr = np.asarray(temp_signal, dtype=float)

    if temp_arr.ndim == 1:
        original_was_single = True
        return [temp_arr], ["sensor_1"], original_was_single

    if temp_arr.ndim == 2:
        sensor_names = [f"sensor_{i + 1}" for i in range(temp_arr.shape[0])]
        sensor_arrays = [temp_arr[i].astype(float) for i in range(temp_arr.shape[0])]
        return sensor_arrays, sensor_names, False

    raise ValueError(
        "temp_signal must be one of the following: "
        "(n_samples,), (n_sensors, n_samples), a list/tuple of (n_samples,) arrays, "
        "or a dict of named (n_samples,) arrays"
    )


def _repair_sensor_data(sensor, sensor_name):
    """
    Repair a single sensor array by interpolating invalid samples when possible.

    Parameters
    ----------
    sensor : np.ndarray of shape (n_samples,)
        One temperature signal.

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
    - A sample is considered invalid if it is NaN or infinite.
    - Invalid samples are repaired by linear interpolation.
    - Edge gaps are filled by extending the nearest valid value.
    - If more than MAX_MISSING_FRACTION_FOR_USABLE of samples are invalid, the
      sensor is marked unusable rather than trusted.
    """
    sensor = np.asarray(sensor, dtype=float)
    warnings = []
    n_samples = int(sensor.shape[0])

    invalid_mask = ~np.isfinite(sensor)
    num_invalid = int(np.sum(invalid_mask))
    missing_fraction = 0.0 if n_samples == 0 else num_invalid / n_samples

    quality = {
        "original_num_samples": n_samples,
        "used_num_samples": n_samples,
        "num_invalid_samples": num_invalid,
        "samples_repaired": num_invalid,
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

    if num_invalid == 0:
        return {
            "usable": True,
            "repaired": sensor.copy(),
            "quality": quality,
            "warnings": warnings,
        }

    if num_invalid == n_samples:
        warnings.append(f"{sensor_name} contains no valid samples and was marked unusable")
        return {
            "usable": False,
            "repaired": None,
            "quality": quality,
            "warnings": warnings,
        }

    if missing_fraction > WARNING_MISSING_FRACTION:
        warnings.append(
            f"{sensor_name} had {num_invalid} invalid samples "
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
    repaired[invalid_mask] = np.nan

    sample_index = np.arange(n_samples)
    finite_mask = np.isfinite(repaired)

    if not np.any(finite_mask):
        warnings.append(f"{sensor_name} had no valid values and was marked unusable")
        return {
            "usable": False,
            "repaired": None,
            "quality": quality,
            "warnings": warnings,
        }

    repaired[invalid_mask] = np.interp(
        sample_index[invalid_mask],
        sample_index[finite_mask],
        repaired[finite_mask],
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
        Per-sensor arrays, each with shape (n_samples,).

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
        raise ValueError("No usable temperature signals remain after data-quality checks")

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
        metadata["quality"]["was_trimmed"] = bool(
            metadata["quality"]["original_num_samples"] != common_length
        )

        if metadata["quality"]["was_trimmed"]:
            metadata["warnings"].append(
                f"{sensor_name} was trimmed from {metadata['quality']['original_num_samples']} "
                f"to {common_length} samples to match the other usable sensors"
            )

    return usable_sensors, usable_names, sensor_metadata, global_warnings


def process_temperature(
    temp_signal,
    min_temp=60.0,
    max_temp=120.0,
    hampel_window=7,
    hampel_n_sigma=3.0,
    ema_alpha=0.2,
    calibration_scale=1.0,
    calibration_offset=0.0,
):
    """
    Run the full temperature pipeline on one or more sensors.

    Parameters
    ----------
    temp_signal : array-like, list, tuple, or dict
        Temperature data.

        Supported formats:
        - Single sensor: shape (n_samples,)
        - Multiple sensors: shape (n_sensors, n_samples)
        - List/tuple of sensor arrays: each shape (n_samples,)
        - Dict of named sensor arrays: each shape (n_samples,)

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
        Structured pipeline output.

        Main keys:
        - "per_sensor": dict of per-sensor results
        - "sensor_names": list of sensor names in order
        - "settings": pipeline settings used for the run
        - "num_sensors": number of sensors processed
        - "num_sensors_received": number of sensors originally provided
        - "num_sensors_processed": number of sensors that were still usable
        - "global_warnings": warnings that apply to the overall run

        Each per-sensor result contains:
        - "usable"
        - "warnings"
        - "quality"
        - "raw"
        - "repaired"
        - "preprocessed"
        - "calibrated"
        - summary statistics from analysis

        Signal stages
        -------------
        - "raw" is the original per-sensor input before any repair.
        - "repaired" is the signal after invalid values (NaN/inf) are interpolated
          and sensors are trimmed to a common usable length.
        - "preprocessed" is the repaired signal after filtering/smoothing
          (range check, Hampel filter, EMA).
        - "calibrated" is the preprocessed signal after the calibration model.

        For backward compatibility:
        If exactly one usable sensor was supplied and the original input was a
        single sensor, the returned dictionary also includes those per-sensor keys
        at the top level.
    """
    sensor_arrays, sensor_names, original_was_single = _normalize_multi_sensor_input(temp_signal)
    num_sensors_received = len(sensor_names)

    usable_sensors, usable_names, sensor_metadata, global_warnings = _prepare_sensor_set(
        sensor_arrays,
        sensor_names,
    )

    if usable_sensors[0].shape[0] == 0:
        raise ValueError("Temperature signal must contain at least one sample")

    sensor_array = np.stack(usable_sensors, axis=0).astype(float)

    preprocessed = preprocess_temperature(
        sensor_array,
        min_temp=min_temp,
        max_temp=max_temp,
        hampel_window=hampel_window,
        hampel_n_sigma=hampel_n_sigma,
        ema_alpha=ema_alpha,
    )

    per_sensor = {}

    for sensor_idx, sensor_name in enumerate(usable_names):
        sensor_preprocessed = preprocessed[sensor_idx]

        analysis = analyze_temperature(
            sensor_preprocessed,
            scale=calibration_scale,
            offset=calibration_offset,
        )

        per_sensor[sensor_name] = {
            "usable": True,
            "warnings": list(sensor_metadata[sensor_name]["warnings"]),
            "quality": dict(sensor_metadata[sensor_name]["quality"]),
            "raw": sensor_metadata[sensor_name]["original_raw"],
            "repaired": sensor_array[sensor_idx],
            "preprocessed": sensor_preprocessed,
            "calibrated": analysis["calibrated"],
            **analysis,
        }

    result = {
        "per_sensor": per_sensor,
        "sensor_names": usable_names,
        "num_sensors": len(usable_names),
        "num_sensors_received": num_sensors_received,
        "num_sensors_processed": len(usable_names),
        "global_warnings": global_warnings,
        "settings": {
            "min_temp": min_temp,
            "max_temp": max_temp,
            "hampel_window": hampel_window,
            "hampel_n_sigma": hampel_n_sigma,
            "ema_alpha": ema_alpha,
            "calibration_scale": calibration_scale,
            "calibration_offset": calibration_offset,
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
        "preprocessed": preprocessed[0] if len(usable_names) == 1 else preprocessed,
    }

    if original_was_single and len(usable_names) == 1:
        result.update(per_sensor[usable_names[0]])

    return result