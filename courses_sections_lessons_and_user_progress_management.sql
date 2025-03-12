-- Create courses table (extends products)
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    difficulty_level TEXT,
    estimated_duration TEXT,
    prerequisites TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id)
);

-- Create sections table
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create lessons table
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT NOT NULL, -- 'video', 'text', 'quiz', 'assignment', 'pdf'
    content JSONB, -- Structured content based on type
    video_url TEXT, -- For video lessons
    pdf_url TEXT, -- For PDF lessons
    duration INTEGER, -- For video lessons (in seconds)
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user progress table
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    last_position INTEGER DEFAULT 0, -- For videos (in seconds)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Add triggers for updated_at
CREATE TRIGGER courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER sections_updated_at
    BEFORE UPDATE ON sections
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER lessons_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER user_progress_updated_at
    BEFORE UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for courses
CREATE POLICY "Courses are viewable by everyone"
    ON courses FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM products p 
        WHERE p.id = courses.product_id AND p.published = true
    ));

CREATE POLICY "Courses are insertable by admin only"
    ON courses FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Courses are updatable by admin only"
    ON courses FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Courses are deletable by admin only"
    ON courses FOR DELETE
    USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for sections
CREATE POLICY "Sections are viewable by everyone"
    ON sections FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM courses c
        JOIN products p ON p.id = c.product_id
        WHERE c.id = sections.course_id AND p.published = true
    ));

CREATE POLICY "Sections are insertable by admin only"
    ON sections FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Sections are updatable by admin only"
    ON sections FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Sections are deletable by admin only"
    ON sections FOR DELETE
    USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for lessons
CREATE POLICY "Lessons are viewable by everyone"
    ON lessons FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM sections s
        JOIN courses c ON c.id = s.course_id
        JOIN products p ON p.id = c.product_id
        WHERE s.id = lessons.section_id AND p.published = true
    ));

CREATE POLICY "Lessons are insertable by admin only"
    ON lessons FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Lessons are updatable by admin only"
    ON lessons FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Lessons are deletable by admin only"
    ON lessons FOR DELETE
    USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for user_progress
CREATE POLICY "Users can view their own progress"
    ON user_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
    ON user_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
    ON user_progress FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all user progress"
    ON user_progress FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');