-- Add policy to allow event owners to update bookings (for cancellation)
CREATE POLICY "Users can update bookings for their events" ON public.bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.event_types 
            WHERE id = bookings.event_type_id 
            AND user_id = auth.uid()
        )
    ); 