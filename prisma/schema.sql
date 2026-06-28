-- ============================================================
-- YAARÉ MARKETPLACE - Schéma PostgreSQL pour Supabase
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- TABLE: users (profiles publics liés à auth.users)
-- ============================================================
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone       TEXT UNIQUE NOT NULL,
  full_name   TEXT NOT NULL DEFAULT 'Utilisateur',
  avatar_url  TEXT,
  city        TEXT,
  neighborhood TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_blocked  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies users
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- TABLE: categories
-- ============================================================
CREATE TABLE public.categories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  icon          TEXT NOT NULL DEFAULT '📦',
  color         TEXT NOT NULL DEFAULT '#6B7280',
  parent_id     UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view categories" ON public.categories
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_verified = TRUE
    )
  );

-- ============================================================
-- TABLE: listings
-- ============================================================
CREATE TABLE public.listings (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id          UUID NOT NULL REFERENCES public.categories(id),
  title                TEXT NOT NULL,
  description          TEXT NOT NULL,
  price                INTEGER NOT NULL CHECK (price >= 0),
  currency             TEXT NOT NULL DEFAULT 'XOF',
  city                 TEXT NOT NULL,
  neighborhood         TEXT,
  condition            TEXT NOT NULL CHECK (condition IN ('new', 'good', 'fair')),
  is_delivery_available BOOLEAN NOT NULL DEFAULT FALSE,
  status               TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'deleted', 'pending')),
  views_count          INTEGER NOT NULL DEFAULT 0,
  published_at         TIMESTAMPTZ DEFAULT NOW(),
  expires_at           TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '60 days'),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Full-text search vector
  search_vector        TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('french', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(city, '')), 'C')
  ) STORED
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_listings_category ON public.listings(category_id);
CREATE INDEX idx_listings_city ON public.listings(city);
CREATE INDEX idx_listings_price ON public.listings(price);
CREATE INDEX idx_listings_published_at ON public.listings(published_at DESC);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_user_id ON public.listings(user_id);
CREATE INDEX idx_listings_search ON public.listings USING GIN(search_vector);
CREATE INDEX idx_listings_active ON public.listings(status, published_at DESC) WHERE status = 'active';

-- Policies listings
CREATE POLICY "Anyone can view active listings" ON public.listings
  FOR SELECT USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Authenticated users can create listings" ON public.listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings" ON public.listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings" ON public.listings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- TABLE: listing_images
-- ============================================================
CREATE TABLE public.listing_images (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id    UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_listing_images_listing ON public.listing_images(listing_id);

CREATE POLICY "Anyone can view listing images" ON public.listing_images
  FOR SELECT USING (TRUE);

CREATE POLICY "Listing owners can manage images" ON public.listing_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id AND user_id = auth.uid()
    )
  );

-- ============================================================
-- TABLE: favorites
-- ============================================================
CREATE TABLE public.favorites (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_favorites_user ON public.favorites(user_id);
CREATE INDEX idx_favorites_listing ON public.favorites(listing_id);

CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- TABLE: reports
-- ============================================================
CREATE TABLE public.reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason      TEXT NOT NULL CHECK (reason IN ('scam', 'inappropriate', 'wrong_category', 'duplicate', 'spam', 'other')),
  details     TEXT,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_reports_listing ON public.reports(listing_id);
CREATE INDEX idx_reports_status ON public.reports(status);

CREATE POLICY "Users can submit reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- ============================================================
-- FUNCTION: Updated_at auto-update trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- FUNCTION: Auto-create user profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, phone, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'Utilisateur')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- FUNCTION: Increment views count
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_views(listing_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.listings
  SET views_count = views_count + 1
  WHERE id = listing_id AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SEED: Insert default categories
-- ============================================================
INSERT INTO public.categories (name, slug, icon, color, display_order) VALUES
  ('Véhicules', 'vehicules', '🚗', '#3B82F6', 1),
  ('Immobilier', 'immobilier', '🏠', '#10B981', 2),
  ('Téléphones', 'telephones', '📱', '#8B5CF6', 3),
  ('Électronique', 'electronique', '💻', '#F59E0B', 4),
  ('Mode & Vêtements', 'mode', '👗', '#EC4899', 5),
  ('Maison & Jardin', 'maison', '🛋️', '#14B8A6', 6),
  ('Produits locaux', 'produits-locaux', '🌾', '#84CC16', 7),
  ('Sports & Loisirs', 'sports', '⚽', '#F97316', 8),
  ('Emplois', 'emplois', '💼', '#6366F1', 9),
  ('Autres', 'autres', '📦', '#6B7280', 10)
ON CONFLICT (slug) DO NOTHING;
