const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const allowedRoles = new Set(["admin", "hod", "faculty", "student"]);

const attachAnnouncementSocket = (httpServer, app, allowedOrigins) => {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (typeof token !== "string" || !token) {
      return next(new Error("Authentication required."));
    }

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      if (!user.userId || !allowedRoles.has(user.role)) {
        return next(new Error("Invalid authentication claims."));
      }
      socket.data.user = user;
      return next();
    } catch {
      return next(new Error("Invalid or expired token."));
    }
  });

  io.on("connection", (socket) => {
    socket.join("authenticated");
  });

  app.set("io", io);
  return io;
};

module.exports = { attachAnnouncementSocket };
