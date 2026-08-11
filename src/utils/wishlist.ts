export const WISHLIST_STORAGE_KEY = 'ar_business_wishlist'

export interface WishlistItem {
    id: string
    name: string
    image: string
    price: number
    type: string
}

export const getWishlist = (): WishlistItem[] => {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
}

export const toggleWishlist = (item: WishlistItem): boolean => {
    const current = getWishlist()
    const exists = current.find(i => i.id === item.id)

    let updated: WishlistItem[]
    let added = false

    if (exists) {
        updated = current.filter(i => i.id !== item.id)
    } else {
        updated = [...current, item]
        added = true
    }

    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updated))

    // Dispatch custom event for real-time UI updates
    window.dispatchEvent(new Event('wishlist-updated'))

    return added
}

export const isInWishlist = (id: string): boolean => {
    return getWishlist().some(i => i.id === id)
}
