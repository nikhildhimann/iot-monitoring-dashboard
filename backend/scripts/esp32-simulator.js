import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Look for .env in the backend directory (one level up from scripts)
dotenv.config({ path: join(__dirname, "..", ".env") });


const getEnvOrThrow = (key) => {
  const value = process.env[key];
  if (!value) {
    console.error(`[FATAL ERROR] ${key} is required but not defined in environment`);
    process.exit(1);
  }
  return value;
};

const getEnvNumOrThrow = (key) => {
  const value = Number(getEnvOrThrow(key));
  if (Number.isNaN(value)) {
    console.error(`[FATAL ERROR] ${key} must be a valid number, received "${process.env[key]}"`);
    process.exit(1);
  }
  return value;
};

const API_URL = getEnvOrThrow("API_URL");
const DEVICE_ID = getEnvOrThrow("DEVICE_ID");
const MIN_DELAY_MS = getEnvNumOrThrow("MIN_DELAY_MS");
const MAX_DELAY_MS = getEnvNumOrThrow("MAX_DELAY_MS");
const MAX_MESSAGES = Number(process.env.MAX_MESSAGES) || 0; // 0 for infinity is a logic choice, but I'll make it configurable too


let sentCount = 0;
let timer = null;

const randomBetween = (min, max) => {
  return Math.random() * (max - min) + min;
};

const randomIntBetween = (min, max) => {
  return Math.floor(randomBetween(min, max + 1));
};

const buildPayload = () => {
  const alertRoll = Math.random();
  let weight = Number(randomBetween(8, 20).toFixed(2));
  let vibration = Math.random() < 0.15;
  let wifiSignal = randomIntBetween(-68, -45);

  if (alertRoll < 0.15) {
    weight = Number(randomBetween(55, 90).toFixed(2));
  } else if (alertRoll < 0.3) {
    weight = Number(randomBetween(0.1, 0.9).toFixed(2));
  } else if (alertRoll < 0.45) {
    wifiSignal = randomIntBetween(-90, -72);
  } else if (alertRoll < 0.6) {
    vibration = true;
  }

  return {
    deviceId: DEVICE_ID,
    weight,
    vibration,
    buzzerOn: vibration,
    ledOn: weight > 50,
    wifiSignal,
    uptime: Math.floor(process.uptime()),
    ipAddress: `192.168.1.${randomIntBetween(10, 50)}`,
    timestamp: new Date().toISOString(),
  };
};

const scheduleNextSend = () => {
  const delay = randomIntBetween(MIN_DELAY_MS, MAX_DELAY_MS);
  timer = setTimeout(sendPayload, delay);
};

const sendPayload = async () => {
  const payload = buildPayload();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    sentCount += 1;
    console.log(
      `[${new Date().toISOString()}] #${sentCount} ${response.status} ${payload.deviceId} ` +
        `weight=${payload.weight} vibration=${payload.vibration} wifi=${payload.wifiSignal}`,
    );

    if (!response.ok) {
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] simulator request failed: ${error.message}`);
  }

  if (MAX_MESSAGES > 0 && sentCount >= MAX_MESSAGES) {
    process.exit(0);
  }

  scheduleNextSend();
};

process.on("SIGINT", () => {
  if (timer) {
    clearTimeout(timer);
  }

  console.log("\nESP32 simulator stopped");
  process.exit(0);
});

console.log(`ESP32 simulator started for ${DEVICE_ID} -> ${API_URL}`);
scheduleNextSend();
