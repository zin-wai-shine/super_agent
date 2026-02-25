# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the app with more memory
ENV NODE_OPTIONS=--max-old-space-size=4096
ARG REACT_APP_API_URL
ARG REACT_APP_GOOGLE_MAPS_API_KEY
ARG REACT_APP_MAIN_DOMAIN
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_GOOGLE_MAPS_API_KEY=$REACT_APP_GOOGLE_MAPS_API_KEY
ENV REACT_APP_MAIN_DOMAIN=$REACT_APP_MAIN_DOMAIN
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy default nginx config (for local Docker)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Railway-specific nginx config template
COPY nginx.railway.conf /etc/nginx/templates/default.conf.template

# Copy built files
COPY --from=builder /app/build /usr/share/nginx/html

# Default PORT for local Docker; Railway overrides this with its own PORT
ENV PORT=3000

CMD ["nginx", "-g", "daemon off;"]
