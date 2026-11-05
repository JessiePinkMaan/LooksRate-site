-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MODERATOR', 'EDITOR', 'USER', 'GUEST');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BANNED', 'TIMEOUT', 'SHADOWBANNED');

-- CreateEnum
CREATE TYPE "AccountProvider" AS ENUM ('TELEGRAM');

-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('UPLOADING', 'QUEUED', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "VideoAssetKind" AS ENUM ('ORIGINAL', 'HLS_PLAYLIST', 'SEGMENT', 'POSTER', 'PREVIEW_SPRITE', 'TEASER', 'SUBTITLE');

-- CreateEnum
CREATE TYPE "AccessRuleType" AS ENUM ('PUBLIC', 'AUTH', 'RANK', 'TIER', 'RANK_AND_TIER', 'PURCHASE', 'DATE');

-- CreateEnum
CREATE TYPE "ReactionKind" AS ENUM ('WHALE', 'HOTDOG', 'DISLIKE');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('VISIBLE', 'PENDING', 'HIDDEN', 'DELETED');

-- CreateEnum
CREATE TYPE "IdeaStatus" AS ENUM ('NEW', 'UNDER_REVIEW', 'PLANNED', 'IN_PROGRESS', 'DONE', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STARS', 'YOOKASSA', 'CRYPTO', 'FAKE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'GRACE', 'EXPIRED', 'CANCELLED', 'REVOKED');

-- CreateEnum
CREATE TYPE "NotificationKind" AS ENUM ('COMMENT_REPLY', 'IDEA_STATUS', 'NEW_VIDEO', 'RANK_UP', 'SUBSCRIPTION_EXPIRING', 'SYSTEM');

-- CreateEnum
CREATE TYPE "QuestKind" AS ENUM ('DAILY', 'WEEKLY', 'CHAIN');

-- CreateEnum
CREATE TYPE "SafetyLevel" AS ENUM ('SAFE', 'CAUTION', 'DANGER');

-- CreateEnum
CREATE TYPE "BanType" AS ENUM ('BAN', 'TIMEOUT', 'SHADOWBAN');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tg_id" TEXT,
    "username" TEXT,
    "display_name" TEXT,
    "avatar_key" TEXT,
    "bio" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "rank" TEXT NOT NULL DEFAULT 'R1',
    "xp" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "last_login_at" TIMESTAMP(3),
    "age_confirmed_at" TIMESTAMP(3),
    "terms_accepted_at" TIMESTAMP(3),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "user_agent" TEXT,
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "AccountProvider" NOT NULL,
    "provider_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranks_config" (
    "rank" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "min_xp" INTEGER NOT NULL,
    "perks_json" JSONB NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ranks_config_pkey" PRIMARY KEY ("rank")
);

-- CreateTable
CREATE TABLE "xp_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "ref_type" TEXT,
    "ref_id" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "reverted_at" TIMESTAMP(3),
    "reverted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "icon" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quests" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "kind" "QuestKind" NOT NULL DEFAULT 'DAILY',
    "xp_reward" INTEGER NOT NULL DEFAULT 20,
    "safety" "SafetyLevel" NOT NULL DEFAULT 'SAFE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_completions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "quest_id" TEXT NOT NULL,
    "date_key" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quest_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tiers" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price_json" JSONB,
    "duration_days" INTEGER,
    "seats_limit" INTEGER,
    "perks_json" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tier_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "source" TEXT,
    "grace_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "external_id" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "raw_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "tier_id" TEXT,
    "discount_json" JSONB,
    "expires_at" TIMESTAMP(3),
    "max_uses" INTEGER,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_redemptions" (
    "id" TEXT NOT NULL,
    "promo_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "redeemed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "VideoStatus" NOT NULL DEFAULT 'UPLOADING',
    "duration" INTEGER,
    "poster_key" TEXT,
    "teaser_key" TEXT,
    "publish_at" TIMESTAMP(3),
    "created_by" TEXT,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allow_comments" BOOLEAN NOT NULL DEFAULT true,
    "allow_reactions" BOOLEAN NOT NULL DEFAULT true,
    "chapters_json" JSONB,
    "subtitles_json" JSONB,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_assets" (
    "id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "kind" "VideoAssetKind" NOT NULL,
    "storage_key" TEXT NOT NULL,
    "resolution" TEXT,
    "size" INTEGER,

    CONSTRAINT "video_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_access_rules" (
    "id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "type" "AccessRuleType" NOT NULL,
    "min_rank" TEXT,
    "min_tier" TEXT,
    "price_id" TEXT,
    "starts_at" TIMESTAMP(3),

    CONSTRAINT "video_access_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watch_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "max_position" INTEGER NOT NULL DEFAULT 0,
    "completed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watch_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playback_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "ip" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "playback_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "kind" "ReactionKind" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "body" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'VISIBLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edited_at" TIMESTAMP(3),

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_reports" (
    "id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bans" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "banned_by" TEXT,
    "type" "BanType" NOT NULL DEFAULT 'BAN',
    "reason" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ideas" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "IdeaStatus" NOT NULL DEFAULT 'NEW',
    "merged_into" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ideas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idea_votes" (
    "id" TEXT NOT NULL,
    "idea_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idea_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idea_status_history" (
    "id" TEXT NOT NULL,
    "idea_id" TEXT NOT NULL,
    "from_status" "IdeaStatus",
    "to_status" "IdeaStatus" NOT NULL,
    "changed_by" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idea_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "kind" "NotificationKind" NOT NULL,
    "payload_json" JSONB NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "target_json" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "publish_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_blocks" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'ru',
    "json" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "glossary_terms" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "definition" TEXT NOT NULL,
    "origin" TEXT,
    "science" TEXT,
    "loxrate_take" TEXT,
    "safety" "SafetyLevel" NOT NULL DEFAULT 'SAFE',
    "sources_json" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "glossary_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "founders" (
    "id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "quote" TEXT,
    "links_json" JSONB,
    "layer_assets_json" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "founders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "referrer_id" TEXT NOT NULL,
    "referee_tg_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value_json" JSONB,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT,
    "actor_role" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "before_json" JSONB,
    "after_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_tg_id_key" ON "users"("tg_id");

-- CreateIndex
CREATE INDEX "users_rank_idx" ON "users"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_id_key" ON "accounts"("provider", "provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "xp_events_idempotency_key_key" ON "xp_events"("idempotency_key");

-- CreateIndex
CREATE INDEX "xp_events_user_id_created_at_idx" ON "xp_events"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "xp_events_type_idx" ON "xp_events"("type");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_key_key" ON "achievements"("key");

-- CreateIndex
CREATE INDEX "user_achievements_achievement_id_idx" ON "user_achievements"("achievement_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_user_id_achievement_id_key" ON "user_achievements"("user_id", "achievement_id");

-- CreateIndex
CREATE UNIQUE INDEX "quests_key_key" ON "quests"("key");

-- CreateIndex
CREATE INDEX "quest_completions_quest_id_idx" ON "quest_completions"("quest_id");

-- CreateIndex
CREATE UNIQUE INDEX "quest_completions_user_id_quest_id_date_key_key" ON "quest_completions"("user_id", "quest_id", "date_key");

-- CreateIndex
CREATE UNIQUE INDEX "tiers_key_key" ON "tiers"("key");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_status_idx" ON "subscriptions"("user_id", "status");

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_provider_external_id_key" ON "payments"("provider", "external_id");

-- CreateIndex
CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "promo_redemptions_promo_id_user_id_key" ON "promo_redemptions"("promo_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "videos_slug_key" ON "videos"("slug");

-- CreateIndex
CREATE INDEX "videos_status_publish_at_idx" ON "videos"("status", "publish_at");

-- CreateIndex
CREATE INDEX "video_assets_video_id_kind_idx" ON "video_assets"("video_id", "kind");

-- CreateIndex
CREATE INDEX "video_access_rules_video_id_idx" ON "video_access_rules"("video_id");

-- CreateIndex
CREATE INDEX "watch_progress_video_id_idx" ON "watch_progress"("video_id");

-- CreateIndex
CREATE UNIQUE INDEX "watch_progress_user_id_video_id_key" ON "watch_progress"("user_id", "video_id");

-- CreateIndex
CREATE INDEX "playback_sessions_user_id_started_at_idx" ON "playback_sessions"("user_id", "started_at");

-- CreateIndex
CREATE INDEX "playback_sessions_video_id_idx" ON "playback_sessions"("video_id");

-- CreateIndex
CREATE INDEX "reactions_target_type_target_id_idx" ON "reactions"("target_type", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_user_id_target_type_target_id_kind_key" ON "reactions"("user_id", "target_type", "target_id", "kind");

-- CreateIndex
CREATE INDEX "comments_target_type_target_id_status_created_at_idx" ON "comments"("target_type", "target_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "comments_user_id_idx" ON "comments"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "comment_reports_comment_id_reporter_id_key" ON "comment_reports"("comment_id", "reporter_id");

-- CreateIndex
CREATE INDEX "bans_user_id_idx" ON "bans"("user_id");

-- CreateIndex
CREATE INDEX "ideas_status_created_at_idx" ON "ideas"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "idea_votes_idea_id_user_id_key" ON "idea_votes"("idea_id", "user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");

-- CreateIndex
CREATE UNIQUE INDEX "content_blocks_key_locale_key" ON "content_blocks"("key", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "glossary_terms_slug_key" ON "glossary_terms"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_code_key" ON "referrals"("code");

-- CreateIndex
CREATE INDEX "referrals_referrer_id_idx" ON "referrals"("referrer_id");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");

-- CreateIndex
CREATE INDEX "audit_log_entity_type_entity_id_idx" ON "audit_log"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_log_actor_id_idx" ON "audit_log"("actor_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_completions" ADD CONSTRAINT "quest_completions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_completions" ADD CONSTRAINT "quest_completions_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_redemptions" ADD CONSTRAINT "promo_redemptions_promo_id_fkey" FOREIGN KEY ("promo_id") REFERENCES "promo_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_redemptions" ADD CONSTRAINT "promo_redemptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_assets" ADD CONSTRAINT "video_assets_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_access_rules" ADD CONSTRAINT "video_access_rules_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_progress" ADD CONSTRAINT "watch_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_progress" ADD CONSTRAINT "watch_progress_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playback_sessions" ADD CONSTRAINT "playback_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playback_sessions" ADD CONSTRAINT "playback_sessions_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_reports" ADD CONSTRAINT "comment_reports_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_reports" ADD CONSTRAINT "comment_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bans" ADD CONSTRAINT "bans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bans" ADD CONSTRAINT "bans_banned_by_fkey" FOREIGN KEY ("banned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea_votes" ADD CONSTRAINT "idea_votes_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea_votes" ADD CONSTRAINT "idea_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea_status_history" ADD CONSTRAINT "idea_status_history_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea_status_history" ADD CONSTRAINT "idea_status_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
