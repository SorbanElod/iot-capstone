const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://telemetry-db-service:27017/telemetry_db";

// MongoDB kapcsolat
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Sikeresen kapcsolódott a MongoDB-hez (Telemetry)!"))
  .catch((err) => console.error("Hiba a MongoDB csatlakozáskor:", err));

// Telemetria Séma (Kiválóan illeszkedik a Mongo-hoz)
const TelemetrySchema = new mongoose.Schema({
  device_id: { type: String, required: true },
  temperature: { type: Number, required: true },
  humidity: { type: Number },
  timestamp: { type: Date, default: Date.now },
});

const Telemetry = mongoose.model("Telemetry", TelemetrySchema);

// Új mérés beküldése
app.post("/api/telemetry", async (req, res) => {
  const { device_id, temperature, humidity } = req.body;
  try {
    // Mentés MongoDB-be
    const newMetric = new Telemetry({ device_id, temperature, humidity });
    const savedMetric = await newMetric.save();

    // Szólunk a Rule Engine-nek a K8s belső hálózatán
    try {
      await fetch("http://rule-app-service:80/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id, temperature, humidity }),
      });
    } catch (ruleErr) {
      console.error("Nem sikerült elérni a Rule Engine-t:", ruleErr.message);
    }

    res.status(201).json(savedMetric);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Hiba a mentés során", details: error.message });
  }
});

// Adatok lekérdezése egy eszközhöz
app.get("/api/telemetry/:deviceId", async (req, res) => {
  try {
    const metrics = await Telemetry.find({ device_id: req.params.deviceId })
      .sort({ timestamp: -1 }) // Legújabb elöl
      .limit(10); // Utolsó 10 mérés
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: "Hiba a lekérdezés során" });
  }
});

app.get("/health", (req, res) => res.status(200).send("Telemetry Service OK"));

app.listen(PORT, () =>
  console.log(`Telemetry Service (MongoDB) fut a ${PORT} porton.`),
);
