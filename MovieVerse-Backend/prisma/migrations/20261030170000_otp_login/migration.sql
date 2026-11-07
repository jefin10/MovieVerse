-- Sign-in is by emailed code now. The password column stays (nullable) until
-- the OTP rollout has settled, so it can be dropped in its own migration.
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;

-- Reset codes were short-lived and have no use without passwords.
DROP TABLE "password_reset_otps";

CREATE TABLE "login_otps" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "request_ip" TEXT,

    CONSTRAINT "login_otps_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "login_otps_email_created_at_idx" ON "login_otps"("email", "created_at");
CREATE INDEX "login_otps_expires_at_idx" ON "login_otps"("expires_at");
