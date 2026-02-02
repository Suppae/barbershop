const http = require("http");
const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

// --- CONFIGURAÇÃO ---
const CALENDAR_ID =
  "0185dd0a7a6d15e2bc309bb7ccc1f4fabe8eaec20b01bae0df4d9900223e99ba@group.calendar.google.com";

const PORT = 3000;

// --- CARREGAR CREDENCIAIS ---
const keyFilePath = path.join(__dirname, "jbbarbershop-a672e3bfc69d.json");

if (!fs.existsSync(keyFilePath)) {
  console.error("Ficheiro de credenciais não encontrado:", keyFilePath);
  process.exit(1);
}

let credentials;
try {
  const rawData = fs.readFileSync(keyFilePath, "utf8");
  credentials = JSON.parse(rawData);
  console.log("Credenciais carregadas com sucesso");
} catch (err) {
  console.error("Erro ao carregar credenciais:", err.message);
  process.exit(1);
}

if (credentials.type !== "service_account") {
  console.error("O JSON não parece ser de service account (type != service_account).");
  process.exit(1);
}

// Normalizar private_key (evita Invalid JWT Signature por \n e CRLF)
if (!credentials.private_key) {
  console.error("private_key não existe no JSON de credenciais.");
  process.exit(1);
}

credentials.private_key = credentials.private_key
  .replace(/\\n/g, "\n")   // caso venham \n literais
  .replace(/\r\n/g, "\n")  // normalizar CRLF
  .trim() + "\n";

// --- AUTH (JWT) ---
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

const auth = new google.auth.JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: SCOPES,
});

const calendar = google.calendar({ version: "v3", auth });

// Helper: ler body JSON
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString("utf8")));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (e) {
        reject(new Error("Body inválido (JSON mal formatado)."));
      }
    });
    req.on("error", reject);
  });
}

// Helper: criar dateTime “local” (sem toISOString a estragar o fuso)
function buildLisbonDateTime(dateStr, timeStr) {
  // Ex: dateStr = "2026-01-17", timeStr = "14:30"
  // Vamos enviar para a API como "YYYY-MM-DDTHH:mm:00" e indicar timeZone.
  // A API trata do fuso.
  return `${dateStr}T${timeStr}:00`;
}

const server = http.createServer(async (req, res) => {
  // CORS simples (se precisares no frontend)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === "POST" && req.url === "/criar-agendamento") {
    try {
      const data = await readJsonBody(req);
      console.log("Recebi:", data);

      // Validações mínimas
      const required = ["date", "time", "haircutType", "firstName", "lastName", "email", "phoneNumber", "hairdresser"];
      for (const k of required) {
        if (!data[k]) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ erro: `Campo em falta: ${k}` }));
        }
      }

      const startDateTime = buildLisbonDateTime(data.date, data.time);

      // Se quiseres sempre 1h:
      // Para evitar conversões, usamos 'end' como start + 1h via Date mas mantendo ISO local.
      // A forma mais simples: parse e voltar a formatar "YYYY-MM-DDTHH:mm:ss".
      const start = new Date(`${data.date}T${data.time}:00`);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const pad = (n) => String(n).padStart(2, "0");
      const endLocal = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}:${pad(end.getSeconds())}`;

      const event = {
        summary: `Corte de cabelo: ${data.haircutType}`,
        description:
          `Cliente: ${data.firstName} ${data.lastName}\n` +
          `Email: ${data.email}\n` +
          `Telefone: ${data.phoneNumber}\n` +
          `Cabeleireiro: ${data.hairdresser}`,
        start: {
          dateTime: startDateTime,
          timeZone: "Europe/Lisbon",
        },
        end: {
          dateTime: endLocal,
          timeZone: "Europe/Lisbon",
        },
      };

      // Forçar auth (bom para apanhar erro cedo)
      await auth.authorize();

      const response = await calendar.events.insert({
        calendarId: CALENDAR_ID,
        requestBody: event,
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          mensagem: "Evento criado com sucesso!",
          eventId: response.data.id,
          htmlLink: response.data.htmlLink,
        })
      );
    } catch (e) {
      console.error("Erro ao criar evento na Google Calendar:");
      console.error("Mensagem:", e.message);
      if (e.response?.data) console.error("Detalhes:", e.response.data);

      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ erro: e.message || "Erro a criar o evento" }));
    }
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Rota não encontrada");
});

server.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});
