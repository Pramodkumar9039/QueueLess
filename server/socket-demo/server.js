const { createServer } = require("node:http");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const { Server } = require("socket.io");

const port = Number(process.env.SOCKET_DEMO_PORT || 5001);
const pagePath = path.join(__dirname, "index.html");
const httpServer = createServer(async (request, response) => {
  if (request.url !== "/") {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  try {
    const page = await readFile(pagePath);
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(page);
  } catch (error) {
    console.error("Could not load the Socket.IO demo page:", error);
    response.writeHead(500);
    response.end("Could not load demo page");
  }
});

const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log(`Demo client connected: ${socket.id}`);

  socket.on("demo:message", (text) => {
    if (typeof text !== "string" || !text.trim() || text.length > 200) {
      socket.emit("demo:error", "Message must be 1-200 characters.");
      return;
    }

    io.emit("demo:message", {
      from: socket.id.slice(0, 6),
      text: text.trim(),
    });
  });

  socket.on("disconnect", () => {
    console.log(`Demo client disconnected: ${socket.id}`);
  });
});

httpServer.listen(port, "127.0.0.1", () => {
  console.log(`Socket.IO demo running at http://127.0.0.1:${port}`);
});
