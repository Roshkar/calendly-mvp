-- Функция для генерации короткого ID
CREATE OR REPLACE FUNCTION generate_short_id() RETURNS VARCHAR(10) AS $$
DECLARE
    chars VARCHAR(36) := 'abcdefghijklmnopqrstuvwxyz0123456789';
    result VARCHAR(10) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * 36 + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Обновляем существующие события, у которых нет short_id
UPDATE public.event_types 
SET short_id = generate_short_id()
WHERE short_id IS NULL OR short_id = '';

-- Убеждаемся, что все события имеют уникальные short_id
-- Если есть дубликаты, генерируем новые
UPDATE public.event_types 
SET short_id = generate_short_id()
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY short_id ORDER BY created_at) as rn
        FROM public.event_types 
        WHERE short_id IS NOT NULL
    ) t WHERE rn > 1
);

-- Удаляем функцию после использования
DROP FUNCTION generate_short_id(); 