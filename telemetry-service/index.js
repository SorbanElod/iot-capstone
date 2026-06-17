const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Kapcsolódás a PostgreSQL-hez a környezeti változóból
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/telemetry_db",
});

// Induláskor létrehozzuk a táblát, ha még nem létezik (hogy ne kelljen kézzel SQL-ezni)
pool
  .query(
    `
  CREATE TABLE IF NOT EXISTS metrics (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    temperature NUMERIC,
    humidity NUMERIC,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`,
  )
  .then(() => console.log("PostgreSQL: metrics tábla ellenőrizve/létrehozva."))
  .catch((err) => console.error("Hiba a tábla létrehozásakor:", err));

// Rule Engine
try {
  await fetch("http://rule-app-service:80/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ device_id, temperature, humidity }),
  });
} catch (ruleErr) {
  console.error("Nem sikerült elérni a Rule Engine-t:", ruleErr.message);
}

res.status(201).json(result.rows[0]);

// API Végpont: Új mérési adat mentése
app.post("/api/telemetry", async (req, res) => {
  const { device_id, temperature, humidity } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO metrics (device_id, temperature, humidity) VALUES ($1, $2, $3) RETURNING *",
      [device_id, temperature, humidity],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Hiba a mentés során", details: error.message });
  }
});

// API Végpont: Adatok lekérdezése egy adott eszközhöz
app.get("/api/telemetry/:deviceId", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM metrics WHERE device_id = $1 ORDER BY timestamp DESC LIMIT 10",
      [req.params.deviceId],
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Hiba a lekérdezés során" });
  }
});

// Healthcheck a Kubernetes számára
app.get("/health", (req, res) => {
  res.status(200).send("Telemetry Service is healthy and running!");
});

app.listen(PORT, () => {
  console.log(`Telemetry Service fut a ${PORT} porton.`);
});
