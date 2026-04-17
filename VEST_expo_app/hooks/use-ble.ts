import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import * as ExpoDevice from 'expo-device';
import { fromByteArray, toByteArray } from 'base64-js';
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
  Subscription,
} from 'react-native-ble-plx';

// Replace these with your peripheral's UUIDs
const DATA_SERVICE_UUID = '19b10000-e8f2-537e-4f6c-d104768a1214';
const DATA_CHARACTERISTIC_UUID = '19b10001-e8f2-537e-4f6c-d104768a1217';
const TARGET_DEVICE_NAME = 'ESP32';
const CHUNK_SIZE = 182;
const WEB_BLE_UNAVAILABLE_MESSAGE =
  'Bluetooth is disabled in web preview. Use an iOS/Android dev build for BLE.';

export type BleLog = { message: string; ts: number };

export function useBle() {
  const bleManager = useMemo(() => {
    if (Platform.OS === 'web') {
      return null;
    }

    try {
      return new BleManager();
    } catch {
      return null;
    }
  }, []);

  const isBleReady = bleManager !== null;
  const bleUnavailableReason = useMemo(() => {
    if (isBleReady) {
      return null;
    }

    if (Platform.OS === 'web') {
      return WEB_BLE_UNAVAILABLE_MESSAGE;
    }

    return 'Bluetooth failed to initialize on this device.';
  }, [isBleReady]);

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [sensorData, setSensorData] = useState<number | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [logs, setLogs] = useState<BleLog[]>([]);

  const dataSubscription = useRef<Subscription | null>(null);
  const scanTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const log = useCallback((message: string) => {
    setLogs((prev) => [{ message, ts: Date.now() }, ...prev].slice(0, 40));
  }, []);

  useEffect(() => {
    return () => {
      scanTimeout.current && clearTimeout(scanTimeout.current);
      dataSubscription.current?.remove();

      if (!bleManager) {
        return;
      }

      bleManager.stopDeviceScan();
      if (connectedDevice) {
        bleManager.cancelDeviceConnection(connectedDevice.id).catch(() => undefined);
      }
      bleManager.destroy();
    };
  }, [bleManager, connectedDevice]);

  const requestAndroid31Permissions = useCallback(async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: 'Scan Permission',
        message: 'BLE requires Bluetooth Scan',
        buttonPositive: 'OK',
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: 'Connect Permission',
        message: 'BLE requires Bluetooth Connect',
        buttonPositive: 'OK',
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'BLE requires Location',
        buttonPositive: 'OK',
      }
    );

    return (
      bluetoothScanPermission === 'granted' &&
      bluetoothConnectPermission === 'granted' &&
      fineLocationPermission === 'granted'
    );
  }, []);

  const requestPermissions = useCallback(async () => {
    if (!isBleReady) {
      setPermissionGranted(false);
      return false;
    }

    if (Platform.OS === 'android') {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'BLE requires Location',
            buttonPositive: 'OK',
          }
        );
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        setPermissionGranted(isGranted);
        return isGranted;
      }

      const isAndroid31PermissionsGranted = await requestAndroid31Permissions();
      setPermissionGranted(isAndroid31PermissionsGranted);
      return isAndroid31PermissionsGranted;
    }

    setPermissionGranted(true);
    return true;
  }, [isBleReady, requestAndroid31Permissions]);

  const isDuplicateDevice = useCallback(
    (devices: Device[], nextDevice: Device) =>
      devices.findIndex((device) => nextDevice.id === device.id) > -1,
    []
  );

  const stopScan = useCallback(() => {
    scanTimeout.current && clearTimeout(scanTimeout.current);

    if (bleManager) {
      bleManager.stopDeviceScan();
    }

    setIsScanning(false);
  }, [bleManager]);

  const onDataUpdate = useCallback(
    (error: BleError | null, characteristic: Characteristic | null) => {
      if (error) {
        log(`Data stream error: ${error.message}`);
        return;
      }

      if (!characteristic?.value) {
        log('No data received from characteristic');
        return;
      }

      const rawData = toByteArray(characteristic.value);
      const reading = rawData[1] ?? rawData[0] ?? 0;

      setSensorData(reading);
      setIsStreaming(true);
      log(`Notify value: ${reading}`);
    },
    [log]
  );

  const encodeUtf8ToBase64 = useCallback((value: string) => {
    const encoded = new TextEncoder().encode(value);
    return fromByteArray(encoded);
  }, []);

  const startStreamingData = useCallback(
    (device: Device) => {
      if (!device) {
        log('No device connected to start streaming');
        return;
      }

      dataSubscription.current?.remove();
      setSensorData(null);
      setIsStreaming(true);
      dataSubscription.current = device.monitorCharacteristicForService(
        DATA_SERVICE_UUID,
        DATA_CHARACTERISTIC_UUID,
        onDataUpdate
      );
      log('Subscribed to notifications');
    },
    [log, onDataUpdate]
  );

  const scanForPeripherals = useCallback(async () => {
    if (!bleManager) {
      log(bleUnavailableReason ?? 'Bluetooth is unavailable.');
      return;
    }

    if (Platform.OS === 'android' && !permissionGranted) {
      const granted = await requestPermissions();
      if (!granted) {
        log('Bluetooth permission denied');
        return;
      }
    }

    setAllDevices([]);
    setIsScanning(true);
    log('Scanning for peripherals...');

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        log(`Scan error: ${error.message}`);
        stopScan();
        return;
      }

      if (!device) return;

      const advertisedName = device.localName ?? device.name;
      if (advertisedName !== TARGET_DEVICE_NAME) {
        return;
      }

      const friendlyName = device.name ?? device.localName ?? 'Unknown peripheral';
      setAllDevices((prev) => {
        if (!isDuplicateDevice(prev, device)) {
          log(`Found peripheral: ${friendlyName}`);
          return [...prev, device];
        }
        return prev;
      });
    });

    scanTimeout.current = setTimeout(() => {
      stopScan();
      log('Stopped scanning (timeout)');
    }, 10000);
  }, [bleManager, bleUnavailableReason, isDuplicateDevice, log, permissionGranted, requestPermissions, stopScan]);

  const connectToDevice = useCallback(
    async (device: Device) => {
      if (!bleManager) {
        log(bleUnavailableReason ?? 'Bluetooth is unavailable.');
        return null;
      }

      setIsConnecting(true);
      setSensorData(null);
      setIsStreaming(false);
      log(`Connecting to ${device.name ?? device.localName ?? device.id}...`);

      try {
        const deviceConnection = await bleManager.connectToDevice(device.id, {
          timeout: 10000,
        });

        setConnectedDevice(deviceConnection);

        if (Platform.OS === 'android') {
          try {
            await deviceConnection.requestMTU(512);
            log('Requested MTU 512');
          } catch (mtuError) {
            const mtuErrorMessage = (mtuError as Error).message ?? 'unknown error';
            log(`MTU request failed: ${mtuErrorMessage}`);
          }
        }

        await deviceConnection.discoverAllServicesAndCharacteristics();
        stopScan();
        log('Connected. Discovering services and characteristics...');

        startStreamingData(deviceConnection);
        return deviceConnection;
      } catch (e) {
        const message = (e as Error).message ?? 'unknown error';
        log(`Failed to connect: ${message}`);
        return null;
      } finally {
        setIsConnecting(false);
      }
    },
    [bleManager, bleUnavailableReason, log, startStreamingData, stopScan]
  );

  const sendDataToDevice = useCallback(
    async (jsonPayload: object) => {
      if (!connectedDevice) {
        log('Cannot send payload: no connected device');
        return false;
      }

      setIsSending(true);

      try {
        const jsonBytes = new TextEncoder().encode(JSON.stringify(jsonPayload));
        const startFrame = encodeUtf8ToBase64('[START]');
        const endFrame = encodeUtf8ToBase64('[END]');

        await connectedDevice.writeCharacteristicWithResponseForService(
          DATA_SERVICE_UUID,
          DATA_CHARACTERISTIC_UUID,
          startFrame
        );

        for (let i = 0; i < jsonBytes.length; i += CHUNK_SIZE) {
          const chunkBytes = jsonBytes.slice(i, i + CHUNK_SIZE);
          const encodedChunk = fromByteArray(chunkBytes);

          await connectedDevice.writeCharacteristicWithResponseForService(
            DATA_SERVICE_UUID,
            DATA_CHARACTERISTIC_UUID,
            encodedChunk
          );
        }

        await connectedDevice.writeCharacteristicWithResponseForService(
          DATA_SERVICE_UUID,
          DATA_CHARACTERISTIC_UUID,
          endFrame
        );

        log(`Sent payload (${jsonBytes.length} bytes) in framed BLE chunks`);
        return true;
      } catch (error) {
        const message = (error as Error).message ?? 'unknown error';
        log(`Failed to send payload: ${message}`);
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [connectedDevice, encodeUtf8ToBase64, log]
  );

  const disconnectFromDevice = useCallback(async () => {
    // Block concurrent connect/disconnect and surface UI spinner
    setIsConnecting(true);

    dataSubscription.current?.remove();
    dataSubscription.current = null;
    setIsStreaming(false);
    setSensorData(null);

    if (!bleManager) {
      setConnectedDevice(null);
      setIsConnecting(false);
      return;
    }

    if (connectedDevice) {
      log(`Disconnect requested for ${connectedDevice.name ?? connectedDevice.localName ?? connectedDevice.id}`);

      try {
        await bleManager.cancelDeviceConnection(connectedDevice.id);
        log('cancelDeviceConnection resolved');
      } catch (e) {
        const message = (e as Error).message ?? 'unknown error';
        log(`cancelDeviceConnection failed: ${message}`);

        try {
          await connectedDevice.cancelConnection();
          log('device.cancelConnection resolved');
        } catch (inner) {
          const innerMsg = (inner as Error).message ?? 'unknown error';
          log(`device.cancelConnection failed: ${innerMsg}`);
        }
      }
    }

    stopScan();
    setConnectedDevice(null);
    setIsConnecting(false);
  }, [bleManager, connectedDevice, log, stopScan]);

  return {
    permissionGranted,
    requestPermissions,
    scanForPeripherals,
    stopScan,
    isScanning,
    isConnecting,
    allDevices,
    connectToDevice,
    disconnectFromDevice,
    connectedDevice,
    sensorData,
    isStreaming,
    isSending,
    sendDataToDevice,
    isBleReady,
    bleUnavailableReason,
    logs,
  };
}
