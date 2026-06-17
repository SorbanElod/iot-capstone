# Használjunk egy könnyű Node.js alap image-et
FROM node:20-alpine

# Munkakönyvtár beállítása a konténeren belül
WORKDIR /usr/src/app

# Csomagleírók átmásolása és függőségek telepítése
COPY package*.json ./
RUN npm install

# A teljes kód átmásolása
COPY . .

# A 3000-es port kinyitása
EXPOSE 3000

# A program indítási parancsa
CMD [ "npm", "start" ]
