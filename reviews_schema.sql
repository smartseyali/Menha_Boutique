-- SQL to create the product_reviews table for Menha Boutique
-- Run this in your Supabase SQL Editor

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS (Row Level Security)
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
-- Anyone can read reviews
CREATE POLICY "Allow public read access" ON public.product_reviews
    FOR SELECT TO anon, authenticated USING (true);

-- Authenticated users can insert their own reviews
-- Note: Simplified for current project setup which uses API key directly
CREATE POLICY "Allow public insert" ON public.product_reviews
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 4. Grant permissions to the anon/authenticated roles
GRANT ALL ON public.product_reviews TO anon, authenticated, service_role;
