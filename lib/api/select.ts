// Colonnes de la vue public_profiles jointes aux annonces : permet
// d'afficher « Vendeur vérifié » sur les cartes sans exposer le téléphone.
export const PUBLIC_PROFILE_COLUMNS = 'id,full_name,avatar_url,is_verified,city,created_at'
export const LISTING_SELLER_EMBED = `user:public_profiles(${PUBLIC_PROFILE_COLUMNS})`
