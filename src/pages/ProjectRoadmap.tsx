import React, { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import ComingSoonCard from '../components/ComingSoonCard'
import { useSettings } from '../hooks/useSettings'
import AdInterstitial from '../components/AdInterstitial'

export default function ProjectRoadmap() {
    const { settings } = useSettings()
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProject, setSelectedProject] = useState<any>(null)
    const [showAd, setShowAd] = useState(false)

    useEffect(() => {
        fetchProjects()
    }, [])

    async function fetchProjects() {
        try {
            const { data: products } = await supabase
                .from('products')
                .select('*')
                .eq('is_project', true)
                .order('created_at', { ascending: false })

            const { data: services } = await supabase
                .from('services')
                .select('*')
                .eq('is_project', true)
                .order('created_at', { ascending: false })

            setProjects([...(products || []), ...(services || [])])
        } catch (err) {
            console.error('Error fetching projects:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleProjectClick = (project: any) => {
        setSelectedProject(project)
        setShowAd(true)
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Header / Hero Section */}
            <div className="relative h-[300px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-gold/10 to-transparent z-0" />
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4">
                        PROJECT <span className="text-gold">ROADMAP</span>
                    </h1>
                    <p className="text-zinc-500 max-w-lg mx-auto text-xs md:text-sm uppercase tracking-[0.3em] font-bold">
                        Découvrez en exclusivité les futures solutions de {settings.site_name}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-20">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[200px] bg-zinc-900/50 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map(project => (
                            <div key={project.id} onClick={() => handleProjectClick(project)} className="cursor-pointer">
                                <ComingSoonCard project={project} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-zinc-900/20 rounded-[40px] border border-dashed border-zinc-800">
                        <p className="text-zinc-600 italic">Aucun projet en cours de développement pour le moment.</p>
                    </div>
                )}
            </div>

            {showAd && selectedProject && (
                <AdInterstitial
                    project={selectedProject}
                    onClose={() => {
                        setShowAd(false)
                        // Ici on pourrait naviguer vers la page détail si elle gère les projets
                        window.location.href = `/product/${selectedProject.id}`
                    }}
                />
            )}
        </div>
    )
}
