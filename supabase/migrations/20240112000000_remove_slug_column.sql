-- Полностью удаляем поле slug, так как мы больше не используем его
ALTER TABLE public.event_types 
DROP COLUMN IF EXISTS slug; 