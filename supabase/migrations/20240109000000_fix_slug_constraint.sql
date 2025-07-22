-- Удаляем уникальное ограничение на user_id и slug, так как теперь используем short_id для уникальности
ALTER TABLE public.event_types 
DROP CONSTRAINT IF EXISTS event_types_user_id_slug_key;

-- Добавляем уникальное ограничение на short_id
ALTER TABLE public.event_types 
ADD CONSTRAINT event_types_short_id_key UNIQUE (short_id);

-- Комментарий для документации
COMMENT ON COLUMN public.event_types.slug IS 'Slug события (больше не уникальный, используется только для внутренних целей)'; 