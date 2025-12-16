FROM node:20-slim

# 1. Instalar OpenSSL (Obligatorio para Prisma en imágenes slim)
# 1. Instalar OpenSSL (Prisma) y dependencias de Puppeteer (Chrome)
RUN apt-get update -y && apt-get install -y \
    openssl \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate --schema=./database/schema.prisma

# 2. Construir la aplicación (Genera la carpeta .output)
RUN npm run build

# 3. Creamos un enlace simbólico. 
# Esto hace que cuando Nuxt busque en '.output/public/uploads', 
# en realidad lea de '/app/public/uploads' (donde tienes tu volumen montado).
RUN mkdir -p public/uploads && \
    rm -rf .output/public/uploads && \
    ln -s /app/public/uploads .output/public/uploads

# 4. Definir host y puerto para asegurar que Docker escuche
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

EXPOSE 3000

# Tu comando de inicio está perfecto
CMD ["sh","-c","npx prisma migrate deploy --schema=./database/schema.prisma && node .output/server/index.mjs"]