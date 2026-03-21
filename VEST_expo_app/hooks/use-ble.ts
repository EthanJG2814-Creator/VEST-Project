import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import * as ExpoDevice from 'expo-device';
import base64 from 'base-64';
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
  Subscription,
} from 'react-native-ble-plx';

const bleManager = new BleManager();

const DATA_SERVICE_UUID = '19b10000-e8f2-537e-4f6c-d104768a1214';
const COLOR_CHARACTERISTIC_UUID = '19b10001-e8f2-537e-4f6c-d104768a1217';
const TARGET_DEVICE_NAMES = ['VEST', 'Arduino'];

export type BleLog = { message: string; ts: number };

export function useBle() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [logs, setLogs] = useState<BleLog[]>([]);
  const dataSubscription = useRef<Subscription | null>(null);
  const scanTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const log = useCallback((message: string) => {
    setLogs((prev) => [{ message, ts: Date.now() }, ...prev].slice(0, 40));
  }, []);

  useEffect(() => {
    return () => {
      scanTimeout.current && clearTimeout(scanTimeout.current);
      bleManager.stopDeviceScan();
      dataSubscription.current?.remove();
      bleManager.destroy();
    };
  }, []);

  const requestAndroid31Permissions = useCallback(async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: 'Location Permission',
        message: 'Bluetooth Low Energy requires Location',
        buttonPositive: 'OK',
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: 'Location Permission',
        message: 'Bluetooth Low Energy requires Location',
        buttonPositive: 'OK',
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Bluetooth Low Energy requires Location',
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
    if (Platform.OS === 'android') {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth Low Energy requires Location',
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
  }, [requestAndroid31Permissions]);

  const isDuplicateDevice = useCallback(
    (devices: Device[], nextDevice: Device) =>
      devices.findIndex((device) => nextDevice.id === device.id) > -1,
    []
  );

  const stopScan = useCallback(() => {
    scanTimeout.current && clearTimeout(scanTimeout.current);
    bleManager.stopDeviceScan();
    setIsScanning(false);
  }, []);

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

      const code = base64.decode(characteristic.value);

      let nextColor = 'white';
      if (code === 'B') nextColor = 'blue';
      else if (code === 'R') nextColor = 'red';
      else if (code === 'G') nextColor = 'green';

      setColor(nextColor);
      log(`Received color code: ${code}`);
    },
    [log]
  );

  const startStreamingData = useCallback(
    (device: Device) => {
      if (!device) {
        log('No device connected to start streaming');
        return;
      }

      dataSubscription.current?.remove();
      dataSubscription.current = device.monitorCharacteristicForService(
        DATA_SERVICE_UUID,
        COLOR_CHARACTERISTIC_UUID,
        onDataUpdate
      );
    },
    [log, onDataUpdate]
  );

  const scanForPeripherals = useCallback(async () => {
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

      const friendlyName = device.name ?? device.localName;
      const matchesTarget = friendlyName
        ? TARGET_DEVICE_NAMES.some((target) => friendlyName.includes(target))
        : false;

      if (friendlyName && (matchesTarget || friendlyName.trim().length > 0)) {
        setAllDevices((prev) => {
          if (!isDuplicateDevice(prev, device)) {
            return [...prev, device];
          }
          return prev;
        });
      }
    });

    scanTimeout.current = setTimeout(() => {
      stopScan();
      log('Stopped scanning (timeout)');
    }, 10000);
  }, [isDuplicateDevice, log, permissionGranted, requestPermissions, stopScan]);

  const connectToDevice = useCallback(
    async (device: Device) => {
      setIsConnecting(true);
      log(`Connecting to ${device.name ?? device.localName ?? device.id}...`);

      try {
        const deviceConnection = await bleManager.connectToDevice(device.id, {
          timeout: 10000,
        });

        setConnectedDevice(deviceConnection);
        await deviceConnection.discoverAllServicesAndCharacteristics();
        bleManager.stopDeviceScan();
        setIsScanning(false);
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
    [log, startStreamingData]
  );

  return {
    permissionGranted,
    requestPermissions,
    scanForPeripherals,
    stopScan,
    isScanning,
    isConnecting,
    allDevices,
    connectToDevice,
    connectedDevice,
    color,
    logs,
  };
}
