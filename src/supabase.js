import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://htxhaxfyaxjtxympackc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eGhheGZ5YXhqdHh5bXBhY2tjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjY3NDQsImV4cCI6MjA4ODI0Mjc0NH0.mLwgTCSdB90LTm0hVfWs1N4dHSRUqA8ugq2LRdgXtLE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)