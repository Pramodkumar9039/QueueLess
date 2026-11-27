const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const User = require("./models/User");

const createSocketAuthMiddleware = () => async (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (typeof token !== "string" || !token.trim()) {
    return next(new Error("Authentication token required"));
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (
      typeof decoded !== "object" ||
      !decoded ||
      typeof decoded.userId !== "string" ||
      !mongoose.Types.ObjectId.isValid(decoded.userId)
    ) {
      return next(new Error("Invalid or expired token"));
    }
  } catch {
    return next(new Error("Invalid or expired token"));
  }

  try {
    const user = await User.findById(decoded.userId)
      .select("_id role isActive")
      .lean();

    if (!user || user.isActive === false) {
      return next(new Error("Invalid or expired token"));
    }

    socket.data.user = {
      userId: user._id.toString(),
      role: user.role,
    };

    return next();
  } catch (error) {
    console.error("Socket authentication lookup error:", error.message);
    return next(new Error("Unable to authenticate socket"));
  }
};

const setupSocketServer = (httpServer, app) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.use(createSocketAuthMiddleware());
  app.set("io", io);

  return io;
};

module.exports = {
  createSocketAuthMiddleware,
  setupSocketServer,
};
