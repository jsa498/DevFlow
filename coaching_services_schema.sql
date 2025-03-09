-- Create coaching_services table
CREATE TABLE coaching_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    initial_consultation_price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create coaching_subscription_plans table
CREATE TABLE coaching_subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES coaching_services(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price_per_month DECIMAL(10,2) NOT NULL,
    sessions_per_month INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_subscriptions table
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES coaching_subscription_plans(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, plan_id)
);

-- Create coaching_sessions table
CREATE TABLE coaching_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'canceled', 'no_show')),
    notes TEXT,
    meeting_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add triggers for updated_at
CREATE TRIGGER coaching_services_updated_at
    BEFORE UPDATE ON coaching_services
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER coaching_subscription_plans_updated_at
    BEFORE UPDATE ON coaching_subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER coaching_sessions_updated_at
    BEFORE UPDATE ON coaching_sessions
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE coaching_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for coaching_services
CREATE POLICY "Coaching services are viewable by everyone"
    ON coaching_services FOR SELECT
    USING (published = true);

CREATE POLICY "Coaching services are insertable by admin only"
    ON coaching_services FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Coaching services are updatable by admin only"
    ON coaching_services FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Coaching services are deletable by admin only"
    ON coaching_services FOR DELETE
    USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for coaching_subscription_plans
CREATE POLICY "Subscription plans are viewable by everyone"
    ON coaching_subscription_plans FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM coaching_services cs
        WHERE cs.id = coaching_subscription_plans.service_id AND cs.published = true
    ));

CREATE POLICY "Subscription plans are insertable by admin only"
    ON coaching_subscription_plans FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Subscription plans are updatable by admin only"
    ON coaching_subscription_plans FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Subscription plans are deletable by admin only"
    ON coaching_subscription_plans FOR DELETE
    USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions"
    ON user_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
    ON user_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
    ON user_subscriptions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all user subscriptions"
    ON user_subscriptions FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for coaching_sessions
CREATE POLICY "Users can view their own coaching sessions"
    ON coaching_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coaching sessions"
    ON coaching_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coaching sessions"
    ON coaching_sessions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all coaching sessions"
    ON coaching_sessions FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update all coaching sessions"
    ON coaching_sessions FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin'); 