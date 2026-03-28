/**
 * Product types - aligned with client project (Well/src/lib/products.ts)
 */

export type ProductCategory = 'motor' | 'esc' | 'fc' | 'ips';
export type ProductSeries = 'Haemng' | 'Maelard' | 'ESC' | 'Flight Controller' | 'IPS';

export interface PerformancePoint {
  throttle: number;
  voltage: number;
  power: number;
  thrust: number;
  rpm: number;
  efficiency: number;
  current: number;
}

export interface MotorProduct {
  id: string;
  series: 'Haemng' | 'Maelard';
  model: string;
  category: 'motor';
  kv: number;
  voltage: string;
  peakCurrent: number;
  recommendedThrust: string;
  peakThrust: string;
  propeller: string;
  diameter: number;
  height: number;
  weight: number;
  escCompat: string;
  powerSource: string;
  performance: PerformancePoint[];
  thrustUnit: string;
}

export interface ESCProduct {
  id: string;
  series: 'ESC';
  model: string;
  category: 'esc';
  continuousCurrent: number;
  currentLimit: number;
  recommendedBattery: string;
  bec: string;
  ipRating: string;
  weight: number;
  size: string;
  powerLine: string;
  motorLine: string;
  throttlePulse: string;
  signalFreq: string;
  signalVoltage: string;
  opTempRange: string;
  speedSignalOutput: boolean;
  errorSignalOutput: boolean;
  protections: string[];
}

export interface FCProduct {
  id: string;
  series: 'Flight Controller';
  model: string;
  category: 'fc';
  opVoltage: string;
  opTemp: string;
  size: string;
  weight: number;
  pwmOutput: string;
  rcIn: string;
  usb: string;
  powerMonitor: string;
  powerInput: string;
  sensor: string;
  compass: boolean;
  vibrationIsolation: boolean;
  uart: number;
  i2c: number;
  can: number;
  adc: string;
  spi: number;
  software: string;
  outputConnector: string;
  communication: string;
}

export interface IPSProduct {
  id: string;
  series: 'IPS';
  model: string;
  category: 'ips';
  motorModel: string;
  escModel: string;
  kv: number;
  voltage: string;
  peakCurrent: number;
  recommendedThrust: string;
  peakThrust: string;
  propeller: string;
  diameter: number;
  height: number;
  depth: number;
  weight: number;
}

export type Product = MotorProduct | ESCProduct | FCProduct | IPSProduct;

export function isMotor(product: Product): product is MotorProduct {
  return product.category === 'motor';
}

export function isESC(product: Product): product is ESCProduct {
  return product.category === 'esc';
}

export function isFC(product: Product): product is FCProduct {
  return product.category === 'fc';
}

export function isIPS(product: Product): product is IPSProduct {
  return product.category === 'ips';
}

export function getDomainForProduct(product: Product): string {
  if (isMotor(product) || isIPS(product)) {
    // Infer domain from KV rating (rough heuristic)
    if (product.kv >= 500) return 'air';
    if (product.kv >= 200) return 'land';
    if (product.kv >= 100) return 'water';
    return 'robotics';
  }
  if (isESC(product)) {
    if (product.continuousCurrent >= 100) return 'land';
    if (product.continuousCurrent >= 50) return 'air';
    return 'water';
  }
  return 'robotics';
}
