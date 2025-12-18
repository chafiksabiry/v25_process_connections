FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Database
ENV MONGODB_URI=mongodb://harx:ix5S3vU6BjKn4MHp@207.180.226.2:27017/V25_HarxPreProd

# Authentication
ENV JWT_SECRET=your_jwt_secret_key_here
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000

# LinkedIn
ENV LINKEDIN_CLIENT_ID=78dci2o5ppds4v
ENV LINKEDIN_CLIENT_SECRET=WPL_AP1.T45rXV4XwyxtS5pl.cTa72w==

# OpenAI
ENV OPENAI_API_KEY=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

# Supabase
ENV NEXT_PUBLIC_SUPABASE_URL=https://ubmusernkksbnxhvsgox.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibXVzZXJua2tzYm54aHZzZ294Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwNTg4NDMsImV4cCI6MjA1MjYzNDg0M30.EtRoTBjDoEOmYvDKVfgKjcXN2mUcxkpFucEOAnEpl78

# Twilio
ENV TWILIO_PHONE_NUMBER=+16185185941
# Please add your Twilio credentials below
ENV TWILIO_ACCOUNT_SID=
ENV TWILIO_AUTH_TOKEN=

# Brevo (Email)
ENV BREVO_API_KEY=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
ENV BREVO_FROM_EMAIL=chafik.sabiry@harx.ai
ENV SMTP_SENDER_NAME=harx

# Misc
ENV IP_INFO_TOKEN=9150a0245fbc83

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]

