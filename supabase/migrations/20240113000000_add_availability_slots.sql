-- Создаем таблицу для слотов доступности
CREATE TABLE public.availability_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type_id UUID NOT NULL REFERENCES public.event_types(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Добавляем индексы для быстрого поиска
CREATE INDEX idx_availability_slots_event_type_id ON public.availability_slots(event_type_id);
CREATE INDEX idx_availability_slots_date ON public.availability_slots(date);
CREATE INDEX idx_availability_slots_active ON public.availability_slots(is_active);

-- Обновляем таблицу bookings для связи со слотами
ALTER TABLE public.bookings 
ADD COLUMN availability_slot_id UUID REFERENCES public.availability_slots(id) ON DELETE CASCADE; 