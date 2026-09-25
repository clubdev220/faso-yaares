import { MapPin, Navigation } from 'lucide-react'

interface ListingMapProps {
  latitude: number
  longitude: number
  label: string
}

// Aperçu OpenStreetMap intégré : ni bibliothèque ni clé d'API.
export function ListingMap({ latitude, longitude, label }: ListingMapProps) {
  const delta = 0.01
  const bbox = [longitude - delta, latitude - delta, longitude + delta, latitude + delta]
    .map((n) => n.toFixed(5))
    .join(',')
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude.toFixed(5)},${longitude.toFixed(5)}`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-100">
        <h2 className="font-heading font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Localisation
        </h2>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-600"
        >
          <Navigation className="w-4 h-4" />
          Ouvrir dans Maps
        </a>
      </div>
      <iframe
        title={`Carte : ${label}`}
        src={embedUrl}
        className="w-full h-56 border-0"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <p className="px-5 py-2 text-xs text-gray-400">
        Position approximative indiquée par le vendeur. ©{' '}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          OpenStreetMap
        </a>
      </p>
    </div>
  )
}
