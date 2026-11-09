import { Link } from 'react-router-dom'
import { useInformationStore } from '../services/information/store'
import { getSystemInfo } from '../services/information/system'
import InformationView from '../components/information/InformationView'
import { SiteNavBar, SiteNavFooter } from '../components/SiteNav'
import { IconHelpCircle, IconInfoCircle } from '../components/Icons'

export default function Information() {
    const { organization, product, publication, operations } = useInformationStore()
    const system = getSystemInfo(publication, operations)

    return (
        <div className="min-h-screen bg-black">
            <div className="border-b border-zinc-900 pt-4 pb-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.25em] mb-1">Centre d'informations</p>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                                INFOR<span className="text-gold">MATIONS</span>
                            </h1>
                            <p className="text-zinc-500 text-sm mt-1">Organisation, produit et informations techniques</p>
                        </div>
                        <SiteNavBar />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
                <div className="flex flex-wrap gap-2">
                    <Link
                        to="/guide"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:border-gold/40"
                    >
                        <IconHelpCircle size={13} /> Centre d'aide
                    </Link>
                    <Link
                        to="/about"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:border-gold/40"
                    >
                        <IconInfoCircle size={13} /> À propos de nous
                    </Link>
                </div>

                <InformationView
                    organization={organization}
                    product={product}
                    system={system}
                    publication={publication}
                />
            </div>

            <SiteNavFooter />
        </div>
    )
}
