const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Környezeti változókból olvassuk be a portot és az adatbázis URL-t
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/device_db';

// 1. Kapcsolódás a MongoDB-hez
mongoose.connect(MONGO_URI)
  .then(() => console.log('Sikeresen kapcsolódott a MongoDB-hez!'))
  .catch(err => console.error('Hiba a MongoDB csatlakozáskor:', err));

// 2. Adatbázis séma (Milyen adatai vannak egy eszköznek)
const DeviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // pl. 'sensor', 'light', 'relay'
  room: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Device = mongoose.model('Device', DeviceSchema);

// 3. API Végpontok (REST API)

// Eszközök listázása
app.get('/api/devices', async (req, res) => {
  try {
    const devices = await Device.find();
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: 'Hiba a lekérdezés során' });
  }
});

// Új eszköz regisztrálása
app.post('/api/devices', async (req, res) => {
  try {
    const newDevice = new Device(req.body);
    const savedDevice = await newDevice.save();
    res.status(201).json(savedDevice);
  } catch (error) {
    res.status(400).json({ error: 'Hibás adatok', details: error.message });
  }
});

// Kubernetes Healthcheck (hogy a K8s tudja, él a programunk)
app.get('/health', (req, res) => {
  res.status(200).send('Device Service is healthy and running!');
});

// Szerver indítása
app.listen(PORT, () => {
  console.log(`Device Service fut a ${PORT} porton.`);
});
