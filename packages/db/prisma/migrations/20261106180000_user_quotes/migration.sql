-- CreateTable
CREATE TABLE "user_quotes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_quotes_user_id_created_at_idx" ON "user_quotes"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "user_quotes" ADD CONSTRAINT "user_quotes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
