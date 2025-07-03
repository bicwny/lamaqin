
-- Run this SQL directly in your Supabase SQL Editor
-- (Go to Supabase Dashboard > SQL Editor > New Query)

CREATE TABLE IF NOT EXISTS public.meditation_topics (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    practice_id uuid REFERENCES public.practices(id),
    topic_number integer NOT NULL,
    title character varying NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT meditation_topics_pkey PRIMARY KEY (id),
    CONSTRAINT meditation_topics_unique_practice_number UNIQUE (practice_id, topic_number)
);

-- Enable Row Level Security if needed
ALTER TABLE public.meditation_topics ENABLE ROW LEVEL SECURITY;
