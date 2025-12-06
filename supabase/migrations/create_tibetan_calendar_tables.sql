-- Migration: Create tibetan_calendar and buddhist_days tables
-- Run this in your Supabase SQL Editor

-- Create tibetan_calendar table for storing Tibetan calendar dates
CREATE TABLE IF NOT EXISTS tibetan_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gregorian_date DATE NOT NULL UNIQUE,
  tibetan_month INTEGER NOT NULL,
  tibetan_day INTEGER NOT NULL,
  tibetan_year INTEGER,
  is_leap_month BOOLEAN DEFAULT FALSE,
  tibetan_month_name TEXT,
  tibetan_day_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast date lookups
CREATE INDEX IF NOT EXISTS idx_tibetan_calendar_date ON tibetan_calendar(gregorian_date);

-- Create buddhist_days table for special Buddhist days (殊胜日)
CREATE TABLE IF NOT EXISTS buddhist_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gregorian_date DATE NOT NULL,
  day_type TEXT NOT NULL,
  day_name TEXT NOT NULL,
  description TEXT,
  multiplier INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast lookups on buddhist_days
CREATE INDEX IF NOT EXISTS idx_buddhist_days_date ON buddhist_days(gregorian_date);
CREATE INDEX IF NOT EXISTS idx_buddhist_days_date_type ON buddhist_days(gregorian_date, day_type);

-- Enable Row Level Security
ALTER TABLE tibetan_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddhist_days ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (reference data accessible to all users)
CREATE POLICY "Allow public read access on tibetan_calendar" 
  ON tibetan_calendar FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read access on buddhist_days" 
  ON buddhist_days FOR SELECT 
  USING (true);

-- Comments explaining table structure
COMMENT ON TABLE tibetan_calendar IS 'Stores Tibetan calendar dates mapped to Gregorian dates';
COMMENT ON COLUMN tibetan_calendar.gregorian_date IS 'The Gregorian calendar date (YYYY-MM-DD)';
COMMENT ON COLUMN tibetan_calendar.tibetan_month IS 'Tibetan month number (1-12)';
COMMENT ON COLUMN tibetan_calendar.tibetan_day IS 'Tibetan day of month (1-30)';
COMMENT ON COLUMN tibetan_calendar.tibetan_year IS 'Tibetan year number';
COMMENT ON COLUMN tibetan_calendar.is_leap_month IS 'True if this is a leap month';
COMMENT ON COLUMN tibetan_calendar.tibetan_month_name IS 'Chinese name for month (e.g., 十月)';
COMMENT ON COLUMN tibetan_calendar.tibetan_day_name IS 'Chinese name for day (e.g., 十八)';

COMMENT ON TABLE buddhist_days IS 'Stores Buddhist special days (殊胜日) with their meanings';
COMMENT ON COLUMN buddhist_days.gregorian_date IS 'The Gregorian calendar date';
COMMENT ON COLUMN buddhist_days.day_type IS 'Category: special_day, fasting_day, auspicious, etc.';
COMMENT ON COLUMN buddhist_days.day_name IS 'Name like 八吉同聚, 十斋日, 释迦牟尼佛成道日';
COMMENT ON COLUMN buddhist_days.description IS 'Detailed description of the day significance';
COMMENT ON COLUMN buddhist_days.multiplier IS 'Merit multiplier for practices on this day';
COMMENT ON COLUMN buddhist_days.display_order IS 'Order for displaying multiple tags on same day';
