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

function getLisbonNow() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Lisbon" }));
}

function getLisbonTodayYMD() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Lisbon" });
}

function isPastDate(dateStr) {
  const todayYMD = getLisbonTodayYMD();
  return dateStr < todayYMD;
}

function isPastTimeSlot(dateStr, timeStr) {
  const todayYMD = getLisbonTodayYMD();
  if (dateStr !== todayYMD) return false;
  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = getLisbonNow();
  const slotTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
  return now >= slotTime;
}
// Helper: verificar disponibilidade do cabeleireiro numa data/hora específica
async function checkHairdresserAvailability(hairdresser, dateStr, timeStr) {
  try {
    // Construir intervalo de tempo: 1 hora (padrão de corte)
    const start = new Date(`${dateStr}T${timeStr}:00`);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    
    const timeMin = start.toISOString();
    const timeMax = end.toISOString();

    // Buscar eventos no calendário para este intervalo
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];
    console.log(JSON.stringify(events))
    // Verificar se existe algum evento com este cabeleireiro
    const conflictingEvent = events.find((event) => {
      const description = event.description || "";
      console.log(description.includes(`Cabeleireiro: ${hairdresser}`), "aqui")
      return description.includes(`Cabeleireiro: ${hairdresser}`);
    });

    return !conflictingEvent; // true se disponível, false se há conflito
  } catch (err) {
    console.error("Erro ao verificar disponibilidade:", err.message);
    throw err;
  }
}

// Helper: buscar horários disponíveis para um barbeiro numa data específica
async function getAvailableTimeSlots(hairdresser, dateStr) {
  try {
    // Horários padrão (9h às 19h, excluindo 13h de almoço)
    const allTimeSlots = [
      "09:00", "10:00", "11:00", "12:00",
      "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
    ];

    // Construir intervalo para o dia completo
    const dayStart = new Date(`${dateStr}T00:00:00`);
    const dayEnd = new Date(`${dateStr}T23:59:59`);
    
    const timeMin = dayStart.toISOString();
    const timeMax = dayEnd.toISOString();

    // Buscar todos os eventos do calendário para este dia
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];

    // Filtrar eventos do cabeleireiro específico
    const hairdresserEvents = events.filter((event) => {
      const description = event.description || "";
      return description.includes(`Cabeleireiro: ${hairdresser}`);
    });

    // Encontrar horários ocupados
    const occupiedTimes = new Set();
    hairdresserEvents.forEach((event) => {
      if (event.start?.dateTime) {
        const startTime = new Date(event.start.dateTime);
        const hour = String(startTime.getHours()).padStart(2, "0");
        const minute = String(startTime.getMinutes()).padStart(2, "0");
        const timeSlot = `${hour}:${minute}`;
        occupiedTimes.add(timeSlot);
      }
    });

    // Retornar apenas horários disponíveis
    const availableSlots = allTimeSlots.filter(time => !occupiedTimes.has(time));
    return availableSlots;
  } catch (err) {
    console.error("Erro ao buscar horários disponíveis:", err.message);
    throw err;
  }
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

  if (req.method === "GET" && req.url.startsWith("/horarios-disponiveis")) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const hairdresser = url.searchParams.get("hairdresser");
      const date = url.searchParams.get("date");

      if (!hairdresser || !date) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ erro: "Parâmetros em falta: hairdresser e date" }));
      }

      if (isPastDate(date)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ erro: "Não é possível marcar em datas passadas." }));
      }

      const availableSlots = await getAvailableTimeSlots(hairdresser, date);
      const filteredSlots = availableSlots.filter((time) => !isPastTimeSlot(date, time));

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ horarios: filteredSlots }));
    } catch (e) {
      console.error("Erro ao buscar horários disponíveis:", e.message);
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ erro: e.message || "Erro ao buscar horários" }));
    }
  }

  if (req.method === "GET" && req.url === "/reviews") {
    try {
      const reviews = [
        {
          author_name: "Luís Manuel",
          text: "Serviço top! Barbeiros muito profissionais e atenciosos. Ambiente limpo, moderno e acolhedor. Recomendo a 100%! A JB Barbershop é sem dúvida a melhor barbearia em Pombal.",
          rating: 5
        },
        {
          author_name: "Diego Rodrigues",
          text: "Top, melhor barbearia de Pombal",
          rating: 5
        },
      ];

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ reviews }));
    } catch (e) {
      console.error("Erro ao buscar reviews:", e.message);
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ erro: e.message || "Erro ao buscar reviews" }));
    }
  }

  if (req.method === "POST") {
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

      // Validar se é domingo
      const selectedDate = new Date(data.date);
      if (selectedDate.getDay() === 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ erro: "Não é possível agendar aos domingos." }));
      }

      if (isPastDate(data.date)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ erro: "Não é possível marcar em datas passadas." }));
      }

      if (isPastTimeSlot(data.date, data.time)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ erro: "Não é possível marcar em horário já passado." }));
      }

      // Verificar disponibilidade do cabeleireiro
      const isAvailable = await checkHairdresserAvailability(data.hairdresser, data.date, data.time);
      
      console.log(isAvailable)
      if (!isAvailable) {
        res.writeHead(409, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            erro: `O cabeleireiro "${data.hairdresser}" não tem disponibilidade neste horário.`,
          })
        );
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
