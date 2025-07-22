-- Добавляем поле для короткого ID события
ALTER TABLE public.event_types 
ADD COLUMN short_id VARCHAR(10) UNIQUE;

-- Создаем индекс для быстрого поиска по short_id
CREATE INDEX idx_event_types_short_id ON public.event_types(short_id);

-- Комментарий для документации
COMMENT ON COLUMN public.event_types.short_id IS 'Короткий уникальный идентификатор события для URL (6 символов)'; 