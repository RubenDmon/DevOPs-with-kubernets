const { connect, StringCodec } = require('nats');
const axios = require('axios');

const NATS_URL = process.env.NATS_URL || "nats://localhost:4222";
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const sc = StringCodec();

const sendMessageToTelegram = async (text) => {
    if (!TELEGRAM_TOKEN || !CHAT_ID) {
        console.log("Telegram not configured, skipping:", text);
        return;
    }
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
        await axios.post(url, {
            chat_id: CHAT_ID,
            text: text
        });
        console.log("Message sent to Telegram:", text);
    } catch (error) {
        console.error("Error sending to Telegram:", error.message);
    }
};

const start = async () => {
    try {
        const nc = await connect({ servers: NATS_URL });
        console.log(`Connected to NATS at ${NATS_URL}`);

        // SUSCRIPCIÓN CON QUEUE GROUP
        // 'queue: "broadcaster-workers"' asegura que si hay 10 pods, 
        // NATS le entrega el mensaje solo a UNO de ellos.
        const sub = nc.subscribe("todo_updates", { queue: "broadcaster-workers" });

        for await (const m of sub) {
            const dataStr = sc.decode(m.data);
            const data = JSON.parse(dataStr);

            console.log(`Received NATS message: ${data.message}`);
            await sendMessageToTelegram(data.message);
        }
    } catch (err) {
        console.error("Error connecting to NATS:", err);
        // Reintentar conexión en 5 segundos si falla
        setTimeout(start, 5000);
    }
};

start();