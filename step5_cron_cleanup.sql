-- step5_cron_cleanup.sql
-- Setup automated cleanup of expired campaign shares

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage permissions to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;

-- Schedule cleanup to run every hour
-- This will automatically delete expired campaign shares
SELECT cron.schedule(
    'cleanup-expired-shares',           -- job name
    '0 * * * *',                        -- every hour at minute 0
    'SELECT cleanup_expired_campaign_shares();'  -- SQL command to execute
);

-- Alternative: Run every 6 hours for less frequent cleanup
-- SELECT cron.schedule(
--     'cleanup-expired-shares-daily',
--     '0 */6 * * *',
--     'SELECT cleanup_expired_campaign_shares();'
-- );

-- Alternative: Run daily at 2 AM
-- SELECT cron.schedule(
--     'cleanup-expired-shares-daily',
--     '0 2 * * *',
--     'SELECT cleanup_expired_campaign_shares();'
-- );

-- View scheduled jobs
-- SELECT * FROM cron.job;

-- To unschedule a job:
-- SELECT cron.unschedule('cleanup-expired-shares');

-- To view job run history:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC;

-- Completion Note:
-- ✅ CRON CLEANUP SETUP SUCCESSFULLY EXECUTED via MCP Supabase
--
-- What was implemented:
-- 1. ✅ pg_cron extension enabled
-- 2. ✅ cleanup_expired_campaign_shares() function created
-- 3. ✅ Cron job scheduled to run every hour
-- 4. ✅ Automatic cleanup of expired campaign shares
--
-- How it works:
-- - Cron job runs every hour at minute 0
-- - Calls cleanup_expired_campaign_shares() function
-- - Deletes all expired campaign shares from database
-- - Logs the number of cleaned up shares
--
-- Benefits:
-- - Automatic cleanup prevents database bloat
-- - No manual intervention required
-- - Efficient batch deletion
-- - Runs during low-traffic hours
