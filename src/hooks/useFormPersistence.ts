import { useState, useEffect } from 'react'

export function useFormPersistence<T>(key: string, initialValue: T) {
    const [state, setState] = useState<T>(() => {
        const saved = sessionStorage.getItem(key)
        if (saved) {
            try {
                return JSON.parse(saved)
            } catch (e) {
                console.error('Error parsing form persistence state', e)
            }
        }
        return initialValue
    })

    useEffect(() => {
        sessionStorage.setItem(key, JSON.stringify(state))
    }, [key, state])

    const clearPersistence = () => {
        sessionStorage.removeItem(key)
    }

    return [state, setState, clearPersistence] as const
}
