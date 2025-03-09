-- Add preferred_days field to coaching_sessions table
ALTER TABLE coaching_sessions ADD COLUMN preferred_days TEXT[];

-- Add preferred_days field to user_subscriptions table
ALTER TABLE user_subscriptions ADD COLUMN preferred_days TEXT[];

-- Note: All coaching services now use a fixed title "One-on-One Coaching"
-- No need to modify the coaching_services table structure

-- Create a function to update coaching_sessions with preferred days
CREATE OR REPLACE FUNCTION update_session_preferred_days()
RETURNS TRIGGER AS $$
BEGIN
    -- When a new subscription is created, copy the preferred_days to any associated sessions
    UPDATE coaching_sessions
    SET preferred_days = NEW.preferred_days
    WHERE subscription_id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update coaching_sessions when a subscription is created or updated
CREATE TRIGGER update_sessions_with_preferred_days
    AFTER INSERT OR UPDATE OF preferred_days ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_session_preferred_days(); 