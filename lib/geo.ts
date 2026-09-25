import { BURKINA_CITY_COORDINATES } from '@/lib/constants'

type Coordinates = { latitude: number; longitude: number }

// Position du navigateur, ou null (refus, indisponible, délai dépassé).
export function getBrowserPosition(timeoutMs = 8000): Promise<Coordinates | null> {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    return Promise.resolve(null)
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 5 * 60 * 1000 }
    )
  })
}

// Coordonnées enregistrées avec une annonce : la position du navigateur,
// sinon le centre de la ville choisie.
export async function getListingCoordinates(city: string): Promise<Coordinates | null> {
  return (await getBrowserPosition()) ?? BURKINA_CITY_COORDINATES[city] ?? null
}

export function parseCoordinate(value: FormDataEntryValue | null, max: number): number | null {
  if (typeof value !== 'string' || value.trim() === '') return null
  const number = Number(value)
  return Number.isFinite(number) && Math.abs(number) <= max ? number : null
}
