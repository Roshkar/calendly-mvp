-- Создаем таблицу для слотов доступности
CREATE TABLE public.availability_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type_id UUID NOT NULL REFERENCES public.event_types(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Уникальность: один слот на одно событие в определенное время
    UNIQUE(event_type_id, date, start_time)
);

-- Добавляем индексы для быстрого поиска
CREATE INDEX idx_availability_slots_event_type_id ON public.availability_slots(event_type_id);
CREATE INDEX idx_availability_slots_date ON public.availability_slots(date);
CREATE INDEX idx_availability_slots_active ON public.availability_slots(is_active);

-- Обновляем таблицу bookings для связи со слотами
ALTER TABLE public.bookings 
ADD COLUMN availability_slot_id UUID REFERENCES public.availability_slots(id) ON DELETE CASCADE;

-- Добавляем поле для отслеживания количества участников в групповых событиях
ALTER TABLE public.availability_slots 
ADD COLUMN current_participants INTEGER DEFAULT 0 CHECK (current_participants >= 0);

-- Создаем функцию для проверки доступности слота
CREATE OR REPLACE FUNCTION check_slot_availability(slot_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    slot_record RECORD;
    event_record RECORD;
BEGIN
    -- Получаем информацию о слоте
    SELECT * INTO slot_record FROM public.availability_slots WHERE id = slot_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Получаем информацию о событии
    SELECT * INTO event_record FROM public.event_types WHERE id = slot_record.event_type_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Проверяем активность слота
    IF NOT slot_record.is_active THEN
        RETURN FALSE;
    END IF;
    
    -- Для индивидуальных событий: слот доступен только если нет бронирований
    IF event_record.event_type_category = 'individual' THEN
        RETURN NOT EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE availability_slot_id = slot_id
        );
    END IF;
    
    -- Для групповых событий: слот доступен если есть место
    IF event_record.event_type_category = 'group' THEN
        RETURN slot_record.current_participants < event_record.max_participants;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для автоматического обновления current_participants
CREATE OR REPLACE FUNCTION update_slot_participants()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Увеличиваем счетчик при создании бронирования
        UPDATE public.availability_slots 
        SET current_participants = current_participants + 1
        WHERE id = NEW.availability_slot_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Уменьшаем счетчик при удалении бронирования
        UPDATE public.availability_slots 
        SET current_participants = current_participants - 1
        WHERE id = OLD.availability_slot_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер
CREATE TRIGGER trigger_update_slot_participants
    AFTER INSERT OR DELETE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_slot_participants();

-- Добавляем RLS политики для availability_slots
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

-- Политика для чтения: все могут читать активные слоты
CREATE POLICY "Anyone can view active availability slots" ON public.availability_slots
    FOR SELECT USING (is_active = true);

-- Политика для создания: только владелец события может создавать слоты
CREATE POLICY "Event owners can create availability slots" ON public.availability_slots
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.event_types 
            WHERE id = event_type_id 
            AND user_id = auth.uid()
        )
    );

-- Политика для обновления: только владелец события может обновлять слоты
CREATE POLICY "Event owners can update availability slots" ON public.availability_slots
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.event_types 
            WHERE id = event_type_id 
            AND user_id = auth.uid()
        )
    );

-- Политика для удаления: только владелец события может удалять слоты
CREATE POLICY "Event owners can delete availability slots" ON public.availability_slots
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.event_types 
            WHERE id = event_type_id 
            AND user_id = auth.uid()
        )
    );

-- Комментарии для документации
COMMENT ON TABLE public.availability_slots IS 'Слоты доступности для событий';
COMMENT ON COLUMN public.availability_slots.event_type_id IS 'ID события';
COMMENT ON COLUMN public.availability_slots.date IS 'Дата слота';
COMMENT ON COLUMN public.availability_slots.start_time IS 'Время начала';
COMMENT ON COLUMN public.availability_slots.end_time IS 'Время окончания';
COMMENT ON COLUMN public.availability_slots.current_participants IS 'Текущее количество участников (для групповых событий)'; 