import { IconStar, IconSparkle, IconMonitor as IconLaptop, IconTools, IconMegaphone } from './Icons'

interface ComingSoonCardProps {
    project: any
}

export default function ComingSoonCard({ project }: ComingSoonCardProps) {
    const rating = (Math.random() * (5.0 - 4.2) + 4.2).toFixed(1)

    // Phase mapping for labels and icons
    const phaseInfo: any = {
        announcement: { label: 'Annonce', icon: <IconMegaphone size={14} />, color: 'text-blue-400' },
        development: { label: 'Développement', icon: <IconLaptop size={14} />, color: 'text-yellow-400' },
        testing: { label: 'Test Final', icon: <IconTools size={14} />, color: 'text-purple-400' },
        reported: { label: 'Reporté', icon: <IconTools size={14} className="opacity-50" />, color: 'text-orange-500' },
        cancelled: { label: 'Annulé', icon: <IconTools size={14} className="text-red-500" />, color: 'text-red-500' },
        finalized: { label: 'Sortie Officielle', icon: <IconSparkle size={14} />, color: 'text-green-400' }
    }

    const currentPhase = phaseInfo[project.project_phase] || phaseInfo.announcement

    return (
        <div className="group relative bg-zinc-900/40 rounded-[32px] p-6 border border-zinc-800/50 hover:bg-zinc-800/60 transition-all duration-500 hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/5 overflow-hidden">
            {/* Background Decorative Gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-gold/10 transition-colors" />

            <div className="flex gap-5 relative z-10">
                {/* Icon & WhatsApp Dot */}
                <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-[22%] bg-zinc-800 border border-white/5 overflow-hidden shadow-xl">
                        {project.image ? (
                            <img src={project.image} alt={project.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-20">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                            </div>
                        )}
                    </div>
                    {/* Notification Dot */}
                    <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-900 shadow-lg animate-pulse" />
                </div>

                {/* Text Container */}
                <div className="flex flex-col justify-center min-w-0">
                    <h3 className="text-xl font-black text-white truncate group-hover:text-gold transition-colors">{project.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${currentPhase.color}`}>
                            {currentPhase.icon} {currentPhase.label}
                        </span>
                        <span className="text-zinc-700">•</span>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            {project.estimated_date || 'Bientôt'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Progress Bar Style Timeline */}
            <div className="mt-8 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter text-zinc-500">
                    <span>Concept</span>
                    <span>Release</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex p-[2px]">
                    <div
                        className={`h-full bg-gradient-to-r from-gold to-yellow-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(212,175,55,0.3)]`}
                        style={{
                            width: project.project_phase === 'announcement' ? '25%' :
                                project.project_phase === 'development' ? '50%' :
                                    project.project_phase === 'testing' ? '75%' :
                                        project.project_phase === 'reported' ? '50%' :
                                            project.project_phase === 'cancelled' ? '0%' : '100%'
                        }}
                    />
                </div>
            </div>

            <p className="mt-6 text-xs text-zinc-500 leading-relaxed line-clamp-2 italic">
                {project.short_desc || 'Découvrez ce projet passionnant en exclusivité sur AR Business.'}
            </p>

            {/* Footer / Stats */}
            <div className="mt-6 pt-5 border-t border-zinc-800/50 flex justify-between items-center">
                <div className="flex items-center gap-1.5 bg-zinc-800/30 px-2 py-1 rounded-lg">
                    <IconStar size={10} className="text-gold" />
                    <span className="text-[10px] font-bold text-white">{rating}</span>
                </div>
                <div className="text-[10px] font-bold text-gold uppercase tracking-widest group-hover:translate-x-1 transition-transform cursor-pointer">
                    Voir Roadmap →
                </div>
            </div>
        </div>
    )
}
