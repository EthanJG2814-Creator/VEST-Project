export const ARDUINO_SENSOR_CSV_HEADER =
  'Timestamp_ms,Therm_C,Therm_F,ECG_Raw,Stretch_Raw,MPU1_Temp,MPU1_AccX,MPU1_AccY,MPU1_AccZ,MPU1_GyroX,MPU1_GyroY,MPU1_GyroZ,MPU2_Temp,MPU2_AccX,MPU2_AccY,MPU2_AccZ,MPU2_GyroX,MPU2_GyroY,MPU2_GyroZ';

const ANALOG_MAX = 4095;

export type SensorIconName =
  | 'thermometer'
  | 'pulse-outline'
  | 'analytics'
  | 'hardware-chip-outline';

export type ArduinoSensorPacket = {
  timestampMs: number;
  thermC: number;
  thermF: number;
  ecgRaw: number | null;
  stretchRaw: number;
  mpu1Temp: number;
  mpu1AccX: number;
  mpu1AccY: number;
  mpu1AccZ: number;
  mpu1GyroX: number;
  mpu1GyroY: number;
  mpu1GyroZ: number;
  mpu2Temp: number;
  mpu2AccX: number;
  mpu2AccY: number;
  mpu2AccZ: number;
  mpu2GyroX: number;
  mpu2GyroY: number;
  mpu2GyroZ: number;
};

export type ArduinoMetricKey = Exclude<keyof ArduinoSensorPacket, 'timestampMs'>;

export type ArduinoMetricSection = 'Thermistor' | 'ECG' | 'Stretch' | 'MPU #1' | 'MPU #2';

export type ArduinoMetricConfig = {
  key: ArduinoMetricKey;
  label: string;
  unit: string;
  decimals: number;
  section: ArduinoMetricSection;
  color: string;
  icon: SensorIconName;
};

export const ARDUINO_METRIC_CONFIG: readonly ArduinoMetricConfig[] = [
  {
    key: 'thermC',
    label: 'Thermistor (C)',
    unit: 'C',
    decimals: 2,
    section: 'Thermistor',
    color: '#F97316',
    icon: 'thermometer',
  },
  {
    key: 'thermF',
    label: 'Thermistor (F)',
    unit: 'F',
    decimals: 2,
    section: 'Thermistor',
    color: '#FB923C',
    icon: 'thermometer',
  },
  {
    key: 'ecgRaw',
    label: 'ECG Raw',
    unit: 'ADC',
    decimals: 0,
    section: 'ECG',
    color: '#F43F5E',
    icon: 'pulse-outline',
  },
  {
    key: 'stretchRaw',
    label: 'Stretch Raw',
    unit: 'ADC',
    decimals: 0,
    section: 'Stretch',
    color: '#A855F7',
    icon: 'analytics',
  },
  {
    key: 'mpu1Temp',
    label: 'MPU1 Temp',
    unit: 'C',
    decimals: 2,
    section: 'MPU #1',
    color: '#0EA5E9',
    icon: 'hardware-chip-outline',
  },
  {
    key: 'mpu1AccX',
    label: 'MPU1 Acc X',
    unit: 'm/s^2',
    decimals: 2,
    section: 'MPU #1',
    color: '#22C55E',
    icon: 'analytics',
  },
  {
    key: 'mpu1AccY',
    label: 'MPU1 Acc Y',
    unit: 'm/s^2',
    decimals: 2,
    section: 'MPU #1',
    color: '#10B981',
    icon: 'analytics',
  },
  {
    key: 'mpu1AccZ',
    label: 'MPU1 Acc Z',
    unit: 'm/s^2',
    decimals: 2,
    section: 'MPU #1',
    color: '#14B8A6',
    icon: 'analytics',
  },
  {
    key: 'mpu1GyroX',
    label: 'MPU1 Gyro X',
    unit: 'rad/s',
    decimals: 2,
    section: 'MPU #1',
    color: '#3B82F6',
    icon: 'pulse-outline',
  },
  {
    key: 'mpu1GyroY',
    label: 'MPU1 Gyro Y',
    unit: 'rad/s',
    decimals: 2,
    section: 'MPU #1',
    color: '#6366F1',
    icon: 'pulse-outline',
  },
  {
    key: 'mpu1GyroZ',
    label: 'MPU1 Gyro Z',
    unit: 'rad/s',
    decimals: 2,
    section: 'MPU #1',
    color: '#8B5CF6',
    icon: 'pulse-outline',
  },
  {
    key: 'mpu2Temp',
    label: 'MPU2 Temp',
    unit: 'C',
    decimals: 2,
    section: 'MPU #2',
    color: '#38BDF8',
    icon: 'hardware-chip-outline',
  },
  {
    key: 'mpu2AccX',
    label: 'MPU2 Acc X',
    unit: 'm/s^2',
    decimals: 2,
    section: 'MPU #2',
    color: '#4ADE80',
    icon: 'analytics',
  },
  {
    key: 'mpu2AccY',
    label: 'MPU2 Acc Y',
    unit: 'm/s^2',
    decimals: 2,
    section: 'MPU #2',
    color: '#34D399',
    icon: 'analytics',
  },
  {
    key: 'mpu2AccZ',
    label: 'MPU2 Acc Z',
    unit: 'm/s^2',
    decimals: 2,
    section: 'MPU #2',
    color: '#2DD4BF',
    icon: 'analytics',
  },
  {
    key: 'mpu2GyroX',
    label: 'MPU2 Gyro X',
    unit: 'rad/s',
    decimals: 2,
    section: 'MPU #2',
    color: '#60A5FA',
    icon: 'pulse-outline',
  },
  {
    key: 'mpu2GyroY',
    label: 'MPU2 Gyro Y',
    unit: 'rad/s',
    decimals: 2,
    section: 'MPU #2',
    color: '#818CF8',
    icon: 'pulse-outline',
  },
  {
    key: 'mpu2GyroZ',
    label: 'MPU2 Gyro Z',
    unit: 'rad/s',
    decimals: 2,
    section: 'MPU #2',
    color: '#A78BFA',
    icon: 'pulse-outline',
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function randomNormal(mean: number, sd: number) {
  const u1 = Math.max(Math.random(), Number.EPSILON);
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * sd;
}

export function createMockArduinoPacket(timestampMs = Date.now()): ArduinoSensorPacket {
  const thermC = randomNormal(38.4, 0.25);

  return {
    timestampMs,
    thermC,
    thermF: thermC * 9.0 / 5.0 + 32.0,
    ecgRaw: Math.random() < 0.04
      ? null
      : Math.round(clamp(randomNormal(2048, 180), 0, ANALOG_MAX)),
    stretchRaw: Math.round(clamp(randomNormal(1680, 95), 0, ANALOG_MAX)),
    mpu1Temp: randomNormal(31.2, 0.25),
    mpu1AccX: randomNormal(0.12, 0.35),
    mpu1AccY: randomNormal(-0.05, 0.35),
    mpu1AccZ: randomNormal(9.81, 0.45),
    mpu1GyroX: randomNormal(0.0, 0.22),
    mpu1GyroY: randomNormal(0.0, 0.22),
    mpu1GyroZ: randomNormal(0.0, 0.22),
    mpu2Temp: randomNormal(31.0, 0.25),
    mpu2AccX: randomNormal(-0.1, 0.35),
    mpu2AccY: randomNormal(0.08, 0.35),
    mpu2AccZ: randomNormal(9.78, 0.45),
    mpu2GyroX: randomNormal(0.0, 0.22),
    mpu2GyroY: randomNormal(0.0, 0.22),
    mpu2GyroZ: randomNormal(0.0, 0.22),
  };
}

export function createMockArduinoTimeline(pointCount: number, samplePeriodMs = 100) {
  const total = Math.max(1, pointCount);
  const now = Date.now();

  return Array.from({ length: total }, (_, index) => {
    const ts = now - (total - 1 - index) * samplePeriodMs;
    return createMockArduinoPacket(ts);
  });
}

function parseNumberToken(token: string) {
  const value = Number(token);
  return Number.isFinite(value) ? value : null;
}

export function parseArduinoCsvLine(line: string): ArduinoSensorPacket | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('---') || trimmed.startsWith('Timestamp_ms')) {
    return null;
  }

  const fields = trimmed.split(',');
  if (fields.length !== 19) {
    return null;
  }

  const timestampMs = parseNumberToken(fields[0]);
  const thermC = parseNumberToken(fields[1]);
  const thermF = parseNumberToken(fields[2]);
  const ecgToken = fields[3].trim();
  const ecgRaw = ecgToken === 'LEAD_OFF' ? null : parseNumberToken(ecgToken);
  const stretchRaw = parseNumberToken(fields[4]);
  const mpu1Temp = parseNumberToken(fields[5]);
  const mpu1AccX = parseNumberToken(fields[6]);
  const mpu1AccY = parseNumberToken(fields[7]);
  const mpu1AccZ = parseNumberToken(fields[8]);
  const mpu1GyroX = parseNumberToken(fields[9]);
  const mpu1GyroY = parseNumberToken(fields[10]);
  const mpu1GyroZ = parseNumberToken(fields[11]);
  const mpu2Temp = parseNumberToken(fields[12]);
  const mpu2AccX = parseNumberToken(fields[13]);
  const mpu2AccY = parseNumberToken(fields[14]);
  const mpu2AccZ = parseNumberToken(fields[15]);
  const mpu2GyroX = parseNumberToken(fields[16]);
  const mpu2GyroY = parseNumberToken(fields[17]);
  const mpu2GyroZ = parseNumberToken(fields[18]);

  if (
    timestampMs === null ||
    thermC === null ||
    thermF === null ||
    (ecgRaw === null && ecgToken !== 'LEAD_OFF') ||
    stretchRaw === null ||
    mpu1Temp === null ||
    mpu1AccX === null ||
    mpu1AccY === null ||
    mpu1AccZ === null ||
    mpu1GyroX === null ||
    mpu1GyroY === null ||
    mpu1GyroZ === null ||
    mpu2Temp === null ||
    mpu2AccX === null ||
    mpu2AccY === null ||
    mpu2AccZ === null ||
    mpu2GyroX === null ||
    mpu2GyroY === null ||
    mpu2GyroZ === null
  ) {
    return null;
  }

  return {
    timestampMs,
    thermC,
    thermF,
    ecgRaw,
    stretchRaw,
    mpu1Temp,
    mpu1AccX,
    mpu1AccY,
    mpu1AccZ,
    mpu1GyroX,
    mpu1GyroY,
    mpu1GyroZ,
    mpu2Temp,
    mpu2AccX,
    mpu2AccY,
    mpu2AccZ,
    mpu2GyroX,
    mpu2GyroY,
    mpu2GyroZ,
  };
}