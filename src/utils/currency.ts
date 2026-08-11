// Utilitaire de formatage des prix — AR Business Digital Store
// Taux de conversion : 1 USD = 600 FCFA (ajustable)
export const USD_TO_FCFA = 600

/**
 * Formate un montant en FCFA
 */
export function formatPriceFCFA(amount: number | null | undefined): string {
    if (amount == null || isNaN(amount) || amount === 0) return 'Gratuit'
    return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' FCFA'
}

/**
 * Formate un montant en EUR
 */
export function formatPriceEUR(amount: number | null | undefined): string {
    if (amount == null || isNaN(amount) || amount === 0) return 'Gratuit'
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

/**
 * Formate un montant en USD
 */
export function formatPriceUSD(amount: number | null | undefined): string {
    if (amount == null || isNaN(amount) || amount === 0) return 'Gratuit'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

/**
 * Affiche les deux prix : FCFA (principal) + USD (secondaire)
 */
export function formatPriceDual(usdPrice: number | null | undefined): { fcfa: string; usd: string } {
    return {
        fcfa: formatPriceFCFA(usdPrice),
        usd: formatPriceUSD(usdPrice),
    }
}
