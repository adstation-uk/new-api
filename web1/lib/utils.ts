import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function renderNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + "B";
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 10000) {
    return (num / 1000).toFixed(1) + "k";
  } else {
    return num.toString();
  }
}

export function renderQuota(quota: number, digits = 2): string {
  // We'll simplify this for now, assuming standard USD display as that's default
  // In a real app, we'd fetch these from context or store
  const quotaPerUnit = 500000; // Default from common/constants.go
  const resultUSD = quota / quotaPerUnit;
  const symbol = "$";
  const value = resultUSD;

  const fixedResult = value.toFixed(digits);
  if (parseFloat(fixedResult) === 0 && quota > 0 && value > 0) {
    const minValue = Math.pow(10, -digits);
    return symbol + minValue.toFixed(digits);
  }
  return symbol + fixedResult;
}
