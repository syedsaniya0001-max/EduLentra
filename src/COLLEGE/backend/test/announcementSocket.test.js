const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const { afterEach, test } = require("node:test");
const jwt = require("jsonwebtoken");
const { io: createSocketClient } = require("socket.io-client");
const { attachAnnouncementSocket } = require("../realtime/announcementSocket");

const testSecret = "announcement-socket-test-secret";
const originalJwtSecret = process.env.JWT_SECRET;
let httpServer;
let io;
let clientSockets = [];

const startSocketServer = async () => {
  process.env.JWT_SECRET = testSecret;
  httpServer = createServer();
  const app = {
    set() {},
  };
  io = attachAnnouncementSocket(httpServer, app);

  await new Promise((resolve) => httpServer.listen(0, "127.0.0.1", resolve));
  const { port } = httpServer.address();
  return `http://127.0.0.1:${port}`;
};

const connectSocket = (url, token) => {
  const socket = createSocketClient(url, {
    auth: token ? { token } : {},
    reconnection: false,
    transports: ["websocket"],
  });
  clientSockets.push(socket);

  return new Promise((resolve, reject) => {
    socket.once("connect", () => resolve(socket));
    socket.once("connect_error", reject);
  });
};

afterEach(async () => {
  for (const socket of clientSockets) socket.disconnect();
  clientSockets = [];
  if (io) {
    await new Promise((resolve) => io.close(resolve));
    io = undefined;
  }
  if (originalJwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalJwtSecret;
  }
});

test("only authenticated application roles connect to announcement updates", async () => {
  const url = await startSocketServer();
  const token = jwt.sign(
    { userId: "student-id", role: "student" },
    testSecret,
    { expiresIn: "1m" }
  );
  const socket = await connectSocket(url, token);
  const notification = new Promise((resolve) =>
    socket.once("announcements:changed", resolve)
  );

  io.to("authenticated").emit("announcements:changed");

  await notification;
});

test("invalid tokens are rejected from announcement updates", async () => {
  const url = await startSocketServer();

  await assert.rejects(connectSocket(url, "not-a-valid-token"), {
    message: "Invalid or expired token.",
  });
});
