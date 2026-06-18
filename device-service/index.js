const express = require("express");
const { Pool } = require("pg");
const app = express();
app.use(express.json());

const client = require("prom-client");

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

const PORT = process.env.PORT || 3000;
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@device-db-service:5432/device_db";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const initDB = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS devices (
          device_id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          type VARCHAR(50) NOT NULL,
          room VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("PostgreSQL kapcsolat sikeres és tábla létrehozva!");
      break;
    } catch (err) {
      console.error(
        `Adatbázis nem elérhető, újrapróbálkozás... (${retries} maradt)`,
        err.message,
      );
      retries -= 1;
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
};

initDB();

app.get("/api/devices", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM devices ORDER BY created_at DESC",
    );
    const formatted = result.rows.map((row) => ({
      ...row,
      location: row.room,
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: `Hiba a lekérdezés során` });
  }
});

app.post("/api/devices", async (req, res) => {
  const { device_id, name, type, location, room } = req.body;
  const finalRoom = location || room || "Ismeretlen";
  try {
    const result = await pool.query(
      "INSERT INTO devices (device_id, name, type, room) VALUES ($1, $2, $3, $4) RETURNING *",
      [device_id, name, type, finalRoom],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: "Hibás adatok", details: error.message });
  }
});

// --- ÚJ VÉGPONT: Eszköz törlése (DELETE) ---
app.delete("/api/devices/:id", async (req, res) => {
  const deviceId = req.params.id; // Ez az URL-ből jön (pl. sensor-02)

  try {
    const result = await pool.query(
      "DELETE FROM devices WHERE device_id = $1 RETURNING *",
      [deviceId],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "A megadott azonosítójú eszköz nem található." });
    }

    res
      .status(200)
      .json({
        message: "Eszköz sikeresen törölve.",
        deletedDevice: result.rows[0],
      });
    console.log(`Eszköz törölve: ID ${deviceId}`);
  } catch (error) {
    console.error("Hiba az eszköz törlésekor:", error);
    res.status(500).json({ error: "Belső szerverhiba a törlés során." });
  }
});

app.get("/health", (req, res) => res.status(200).send("Device Service OK"));

app.listen(PORT, () => console.log(`Fut a ${PORT} porton.`));
