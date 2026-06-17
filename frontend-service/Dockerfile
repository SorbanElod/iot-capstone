# --- 1. ÉPÍTÉSI FÁZIS (Build Stage) ---
FROM node:20-alpine as build
WORKDIR /app

# Csak a package.json-t másoljuk először a gyorsabb Docker cache miatt
COPY package*.json ./
RUN npm install

# Teljes forráskód másolása és a statikus fájlok (dist mappa) legenerálása
COPY . .
RUN npm run build


# --- 2. FUTTATÁSI FÁZIS (Production Stage) ---
FROM nginx:alpine

# Eltávolítjuk az alapértelmezett Nginx weboldalt
RUN rm -rf /usr/share/nginx/html/*

# Bemásoljuk a saját Nginx konfigurációnkat
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Átmásoljuk az 1. fázisban lefordított React fájlokat az Nginx publikus mappájába
COPY --from=build /app/dist /usr/share/nginx/html

# Kinyitjuk a 80-as portot
EXPOSE 80

# Nginx indítása a háttérben
CMD ["nginx", "-g", "daemon off;"]