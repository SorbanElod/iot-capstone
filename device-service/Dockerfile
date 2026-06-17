FROM node:20-alpine

WORKDIR /usr/src/app

# Először CSAK a package fájlokat másoljuk
COPY package*.json ./

# Telepítjük a csomagokat a Linux konténerbe
RUN npm install

# MOST jön a trükk: Másolunk mindent (Még a rossz node_modules-t is, HA van)
COPY . .

# DE UGYANABBAN A LÉPÉSBEN, kényszerítünk egy durva újraépítést a Linux rendszeren belül!
# Ez letörli a behozott szemetet, és frissen lehúzza a pg modult is, garantáltan a Linuxhoz fordítva.
RUN rm -rf node_modules package-lock.json && npm install

EXPOSE 3000

# Kőegyszerű indítás, nincs Array formátum, nincs "npm start" kavarodás
CMD node index.js