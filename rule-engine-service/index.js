const express = require("express");
const redis = require("redis");

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3002;

// Kapcsolódás a Redis-hez a K8s belső hálózatán
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.log("Redis Hiba:", err));
redisClient.connect().then(async () => {
  console.log("Sikeresen kapcsolódott a Redis-hez!");
  // Induláskor beállítunk egy 30 fokos alap limitet, ha még nincs semmi beállítva
  const limit = await redisClient.get("temperature_limit");
  if (!limit) {
    await redisClient.set("temperature_limit", "30");
  }
});

// API (KÜLSŐ): Új riasztási limit beállítása
app.post("/api/rules", async (req, res) => {
  const { temperature_limit } = req.body;
  if (!temperature_limit) {
    return res.status(400).json({ error: "Hiányzó adat: temperature_limit" });
  }
  await redisClient.set("temperature_limit", temperature_limit.toString());
  res.json({
    message: `Új hőmérséklet limit beállítva: ${temperature_limit}°C`,
  });
});

// API (KÜLSŐ): Aktuális limit lekérése
app.get("/api/rules", async (req, res) => {
  const limit = await redisClient.get("temperature_limit");
  res.json({ temperature_limit: parseFloat(limit) });
});

// API (BELSŐ): Riasztás kiértékelése (Ezt a Telemetry hívja meg belülről)
app.post("/api/evaluate", async (req, res) => {
  const { device_id, temperature } = req.body;
  let alertTriggered = false;
  let message = "Minden érték normális.";

  // Kiolvassuk a dinamikus limitet a Redis-ből
  const limitStr = await redisClient.get("temperature_limit");
  const limit = limitStr ? parseFloat(limitStr) : 30;

  if (temperature && temperature > limit) {
    alertTriggered = true;
    message = `⚠️ RIASZTÁS: ${device_id} hőmérséklete kritikus: ${temperature}°C (Limit: ${limit}°C)`;

    const alertData = {
      device_id,
      temperature,
      limit,
      message,
      timestamp: new Date().toISOString(),
    };

    // Elmentjük a Redis-be (egy listába)
    await redisClient.lPush("alerts", JSON.stringify(alertData));
    await redisClient.lTrim("alerts", 0, 49); // Max 50 elem

    console.log(message);
  }

  res.status(200).json({ alertTriggered, message });
});

// API (KÜLSŐ): Riasztások lekérése
app.get("/api/alerts", async (req, res) => {
  try {
    const alerts = await redisClient.lRange("alerts", 0, -1);
    res.json(alerts.map((a) => JSON.parse(a)));
  } catch (error) {
    res.status(500).json({ error: "Hiba a lekérdezés során" });
  }
});

app.get("/health", (req, res) => res.send("Rule Engine is healthy!"));

app.listen(PORT, () => console.log(`Rule Engine fut a ${PORT} porton.`));
