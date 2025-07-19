-- Добавляем поле для категории события (групповое/индивидуальное)
ALTER TABLE public.event_types 
ADD COLUMN event_type_category VARCHAR(20) DEFAULT 'individual' CHECK (event_type_category IN ('individual', 'group'));

-- Добавляем поле для максимального количества участников группового события
ALTER TABLE public.event_types 
ADD COLUMN max_participants INTEGER DEFAULT 1 CHECK (max_participants >= 1);

-- Обновляем существующие записи
UPDATE public.event_types 
SET event_type_category = 'individual', max_participants = 1 
WHERE event_type_category IS NULL;

-- Комментарии для документации
COMMENT ON COLUMN public.event_types.event_type_category IS 'Тип события: individual (1-на-1) или group (групповое)';
COMMENT ON COLUMN public.event_types.max_participants IS 'Максимальное количество участников (для групповых событий)'; 