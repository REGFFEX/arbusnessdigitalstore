/**
 * AR Business Store II - Unified Currency Converter
 * Centralizes rates and logic for USD, FCFA, and EUR conversions.
 */

export const EXCHANGE_RATES = {
    USD_TO_FCFA: 650,
    USD_TO_EUR: 0.92,
    EUR_TO_USD: 1 / 0.92,
    FCFA_TO_USD: 1 / 650,
}

export interface Currencies {
    usd: number;
    fcfa: number;
    eur: number;
}

/**
 * Converts a base value from a specific currency to all three.
 */
export const syncCurrencies = (value: number, from: 'usd' | 'fcfa' | 'eur'): Currencies => {
    let usd = 0;

    // Pivot to USD first
    if (from === 'usd') usd = value;
    else if (from === 'fcfa') usd = value * EXCHANGE_RATES.FCFA_TO_USD;
    else if (from === 'eur') usd = value * EXCHANGE_RATES.EUR_TO_USD;

    return {
        usd: parseFloat(usd.toFixed(2)),
        fcfa: Math.round(usd * EXCHANGE_RATES.USD_TO_FCFA),
        eur: parseFloat((usd * EXCHANGE_RATES.USD_TO_EUR).toFixed(2))
    }
}

/**
 * Calculates total price based on Ad video count and price per video.
 */
export const calculateAdsToPrice = (count: number, pricePerVideo: number): Currencies => {
    const usd = count * pricePerVideo;
    return syncCurrencies(usd, 'usd');
}
