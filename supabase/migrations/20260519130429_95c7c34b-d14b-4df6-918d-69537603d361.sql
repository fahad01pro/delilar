ALTER TABLE public.category_banners ADD COLUMN IF NOT EXISTS page text;
ALTER TABLE public.category_banners ADD COLUMN IF NOT EXISTS position smallint NOT NULL DEFAULT 1;
UPDATE public.category_banners SET page = category WHERE page IS NULL;
CREATE INDEX IF NOT EXISTS idx_category_banners_page_position ON public.category_banners(page, position);