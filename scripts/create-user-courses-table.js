
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createUserCoursesTable() {
  try {
    console.log('🔧 Creating user_courses table...');
    
    // Create the table using a raw SQL query
    const { error } = await supabase.rpc('exec', {
      sql: `
        -- Drop table if it exists to recreate with proper constraints
        DROP TABLE IF EXISTS user_courses CASCADE;
        
        -- Create user_courses table with proper foreign keys
        CREATE TABLE user_courses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
          joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
          completed_date DATE,
          progress_percentage DECIMAL(5,2) DEFAULT 0.00,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          -- Ensure a user can't join the same course twice
          UNIQUE(user_id, course_id)
        );
        
        -- Enable RLS
        ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;
        
        -- RLS Policy
        CREATE POLICY "Users can manage their own course enrollments" 
        ON user_courses FOR ALL 
        USING (auth.uid()::text = user_id::text);
        
        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_user_courses_user_id ON user_courses(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_courses_course_id ON user_courses(course_id);
      `
    });
    
    if (error) {
      console.error('❌ Error creating table with exec:', error);
      
      // Try alternative approach using individual queries
      console.log('🔄 Trying alternative approach...');
      
      // Drop existing table
      await supabase.from('user_courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // We'll create it manually through the Supabase dashboard or use a different approach
      console.log('📝 Please create the user_courses table manually in Supabase:');
      console.log(`
        CREATE TABLE user_courses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
          joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
          completed_date DATE,
          progress_percentage DECIMAL(5,2) DEFAULT 0.00,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, course_id)
        );
        
        ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can manage their own course enrollments" 
        ON user_courses FOR ALL 
        USING (auth.uid()::text = user_id::text);
      `);
      return;
    }
    
    console.log('✅ user_courses table created successfully!');
    
  } catch (err) {
    console.error('❌ Setup failed:', err);
  }
}

createUserCoursesTable();
