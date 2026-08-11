import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

import { ARDES_CONFIG } from '../config/ardes_config'

export default function ProtectedRoute() {
  const { isAdmin, adminData, loading } = useAuth()
  const location = useLocation()
  const ADMIN_BASE = ARDES_CONFIG.ADMIN_PATH

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-gold animate-pulse text-xl font-bold flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          Vérification des permissions...
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    // Si l'admin est bloqué ou en attente, on affiche un message spécifique
    if (adminData?.status === 'blocked') {
      return (
        <div className="p-10 text-center">
          <h1 className="text-3xl text-red-500 font-bold mb-4">Accès Bloqué</h1>
          <p className="text-gray-400">Votre compte administrateur a été suspendu par le Master Admin.</p>
        </div>
      )
    }

    if (adminData?.status === 'pending') {
      return (
        <div className="p-10 text-center">
          <h1 className="text-3xl text-gold font-bold mb-4">Accès en Attente</h1>
          <p className="text-gray-400">Votre compte doit être validé par Ahraf (Master Admin) avant de pouvoir accéder au panneau.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 text-gold underline"
          >
            Retour à l'accueil
          </button>
        </div>
      )
    }

    // Sinon Redirection vers login
    return <Navigate to={`/${ADMIN_BASE}/login`} state={{ from: location }} replace />
  }

  return <Outlet />
}
