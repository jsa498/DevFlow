-- Add test_mode field to purchases table
ALTER TABLE purchases ADD COLUMN test_mode BOOLEAN DEFAULT NULL;
ALTER TABLE purchases ADD COLUMN stripe_session_id TEXT DEFAULT NULL;

-- Update existing purchases based on Stripe key
-- This will set test_mode to true for all existing purchases since they were likely created in test mode
UPDATE purchases SET test_mode = TRUE WHERE test_mode IS NULL;

-- Create an index on test_mode for better query performance
CREATE INDEX idx_purchases_test_mode ON purchases(test_mode); 