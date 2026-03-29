/**
 * Currency Converters
 * In a real app, these rates would be fetched from an API
 */
const mockRates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.1,
    JPY: 150.5
};

export const convertCurrency = (amount, from, to) => {
    if (!mockRates[from] || !mockRates[to]) throw new Error("Unsupported currency");
    const amountInUSD = amount / mockRates[from];
    return amountInUSD * mockRates[to];
};

/**
 * Unit Converters
 */
export const convertLength = (amount, from, to) => {
    // base: meters
    const toMeter = { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.34, yd: 0.9144, ft: 0.3048, in: 0.0254 };
    if (!toMeter[from] || !toMeter[to]) throw new Error("Unsupported length unit");
    return (amount * toMeter[from]) / toMeter[to];
};

export const convertWeight = (amount, from, to) => {
    // base: kg
    const toKg = { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495 };
    if (!toKg[from] || !toKg[to]) throw new Error("Unsupported weight unit");
    return (amount * toKg[from]) / toKg[to];
};

export const convertTemperature = (amount, from, to) => {
    if (from === to) return amount;
    let c;
    if (from === 'C') c = amount;
    else if (from === 'F') c = (amount - 32) * 5 / 9;
    else if (from === 'K') c = amount - 273.15;
    else throw new Error("Unsupported temperature unit");

    if (to === 'C') return c;
    if (to === 'F') return (c * 9 / 5) + 32;
    if (to === 'K') return c + 273.15;
};

/**
 * Health Calculators
 */
export const calculateBMI = (weightKg, heightCm) => {
    if (heightCm <= 0 || weightKg <= 0) throw new Error("Invalid height or weight");
    return weightKg / Math.pow(heightCm / 100, 2);
};

export const calculateAge = (birthDateStr) => {
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

/**
 * EMI Calculator (Equated Monthly Installment)
 */
export const calculateEMI = (principal, annualRate, months) => {
    if (principal <= 0 || annualRate <= 0 || months <= 0) throw new Error("Invalid parameters");
    const monthlyRate = annualRate / (12 * 100);
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    return emi;
};
