FROM node:22-bookworm-slim AS builder

WORKDIR /app

ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
ARG NEXT_PUBLIC_KAKAO_MAP_KEY=""

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_KAKAO_MAP_KEY=$NEXT_PUBLIC_KAKAO_MAP_KEY

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build \
  && npm prune --omit=dev

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app ./

RUN mkdir -p /app/data

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=5 CMD ["node", "-e", "fetch('http://127.0.0.1:3000').then((res)=>process.exit(res.ok?0:1)).catch(()=>process.exit(1))"]

CMD ["npm", "run", "start"]
