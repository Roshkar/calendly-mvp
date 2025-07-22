-- Делаем поле slug nullable, так как мы больше не используем его
ALTER TABLE public.event_types 
ALTER COLUMN slug DROP NOT NULL;

-- Комментарий для документации
COMMENT ON COLUMN public.event_types.slug IS 'Slug события (nullable, больше не используется для URL)'; 