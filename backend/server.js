const http = require("http");
const { google } = require("googleapis");

// --- CONFIGURAÇÃO ---
const CALENDAR_ID = "0185dd0a7a6d15e2bc309bb7ccc1f4fabe8eaec20b01bae0df4d9900223e99ba@group.calendar.google.com";

// Configuração da autenticação com Google API (service account)
const auth = new google.auth.GoogleAuth({
  keyFile: "jbbarbershop-c219fbcb1019.json", // ficheiro da service account
  scopes: ["https://www.googleapis.com/auth/calendar"],
});

const calendar = google.calendar({ version: "v3", auth });

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/criar-agendamento") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        console.log("Recebi:", data);

        // Converter date + time para formato ISO
        const startDateTime = new Date(`${data.date}T${data.time}:00`);
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +1 hora

        // Criar evento no Google Calendar
        const event = {
          summary: `Corte de cabelo: ${data.haircutType}`,
          description: `Cliente: ${data.firstName} ${data.lastName}\nEmail: ${data.email}\nTelefone: ${data.phoneNumber}\nCabeleireiro: ${data.hairdresser}`,
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: "Europe/Lisbon",
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: "Europe/Lisbon",
          },
        };

        const response = await calendar.events.insert({
          calendarId: CALENDAR_ID,
          requestBody: event,
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ mensagem: "Evento criado com sucesso!", eventId: response.data.id }));

      } catch (e) {
        console.error(e);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ erro: "Erro a criar o evento" }));
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Rota não encontrada");
  }
});

server.listen(3000, () => {
  console.log("Servidor a correr em http://localhost:3000");
});
