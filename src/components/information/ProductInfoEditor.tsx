import { useInformationStore } from '../../services/information/store'
import { InfoCard, InfoInput, InfoNote, InfoTextarea } from './parts'
import { IconPackage } from '../Icons'

export default function ProductInfoEditor() {
    const { product, updateProduct } = useInformationStore()

    return (
        <InfoCard
            title="Informations du produit"
            subtitle="Gérées par l'administrateur de cette application · jamais remplacées par un import institutionnel"
            source="product"
            icon={<IconPackage size={17} />}
        >
            <div className="grid gap-3 sm:grid-cols-2">
                <InfoInput label="Nom du produit" value={product.name} onChange={value => updateProduct({ name: value })} />
                <InfoInput label="Responsable du produit" value={product.owner} onChange={value => updateProduct({ owner: value })} />
                <InfoInput label="Équipe produit" value={product.team} onChange={value => updateProduct({ team: value })} />
                <InfoInput label="Logo (URL)" value={product.logo_url} onChange={value => updateProduct({ logo_url: value })} placeholder="https://" />
                <InfoInput label="Plateformes" value={product.platforms} onChange={value => updateProduct({ platforms: value })} placeholder="Web, Android, Windows…" />
                <InfoInput label="Langues disponibles" value={product.languages} onChange={value => updateProduct({ languages: value })} />
                <InfoInput label="Site web du produit" value={product.website} onChange={value => updateProduct({ website: value })} placeholder="https://" />
                <InfoInput label="Contacts spécifiques" value={product.contacts} onChange={value => updateProduct({ contacts: value })} />
                <InfoInput label="Support" value={product.support} onChange={value => updateProduct({ support: value })} />
                <InfoInput label="Documentation" value={product.documentation} onChange={value => updateProduct({ documentation: value })} placeholder="https://" />
            </div>
            <div className="mt-3 space-y-3">
                <InfoTextarea label="Description du produit" value={product.description} onChange={value => updateProduct({ description: value })} rows={3} />
                <InfoTextarea
                    label="Fonctionnalités principales (une par ligne)"
                    value={product.features}
                    onChange={value => updateProduct({ features: value })}
                    rows={4}
                />
                <InfoTextarea label="Conditions d'utilisation du produit" value={product.terms} onChange={value => updateProduct({ terms: value })} rows={4} />
            </div>
            <InfoNote>
                Les champs laissés vides apparaissent comme « Non renseigné » dans les pages publiques.
            </InfoNote>
        </InfoCard>
    )
}
