const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const request = require("supertest");
const os = require("os");
const { MongoMemoryReplSet } = require("mongodb-memory-server");

process.env.MONGOMS_VERSION = "7.0.14";
process.env.JWT_SECRET = "queueless-test-secret";

jest.setTimeout(120000);

const User = require("../models/User");
const { loginUser } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const staffMiddleware = require("../middleware/staffMiddleware");

const app = express();
app.use(express.json());
app.post("/login", loginUser);
app.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({ user: req.user });
});
app.get("/staff", authMiddleware, staffMiddleware, (req, res) => {
  res.sendStatus(200);
});
app.get("/admin", authMiddleware, adminMiddleware, (req, res) => {
  res.sendStatus(200);
});

let replSet;

const createToken = (user, role = user.role) =>
  jwt.sign(
    {
      userId: user._id.toString(),
      role,
    },
    process.env.JWT_SECRET
  );

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({
    replSet: {
      count: 1,
      storageEngine: "wiredTiger",
    },
  });

  await mongoose.connect(replSet.getUri(), {
    runtimeAdapters: {
      os,
    },
  });
  await User.init();
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await replSet.stop();
});

describe("JWT current-user authentication", () => {
  test("accepts a valid JWT for an existing user", async () => {
    const user = await User.create({
      name: "Customer",
      email: "customer@example.test",
      password: "password",
      role: "customer",
    });

    const response = await request(app)
      .get("/me")
      .set("Authorization", `Bearer ${createToken(user)}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toEqual({
      userId: user._id.toString(),
      role: "customer",
    });
  });

  test("rejects an invalid JWT", async () => {
    const response = await request(app)
      .get("/me")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
  });

  test("rejects a JWT after the user is deleted", async () => {
    const user = await User.create({
      name: "Deleted User",
      email: "deleted@example.test",
      password: "password",
    });
    const token = createToken(user);
    await User.deleteOne({ _id: user._id });

    const response = await request(app)
      .get("/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  test("uses the current role after staff privileges are revoked", async () => {
    const user = await User.create({
      name: "Former Staff",
      email: "former-staff@example.test",
      password: "password",
      role: "staff",
    });
    const token = createToken(user);
    await User.updateOne({ _id: user._id }, { $set: { role: "customer" } });

    const response = await request(app)
      .get("/staff")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  test("uses the current role after customer privileges are upgraded", async () => {
    const user = await User.create({
      name: "Promoted Customer",
      email: "promoted@example.test",
      password: "password",
      role: "customer",
    });
    const token = createToken(user);
    await User.updateOne({ _id: user._id }, { $set: { role: "staff" } });

    const response = await request(app)
      .get("/staff")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  test("rejects an otherwise valid JWT for a disabled account", async () => {
    const user = await User.create({
      name: "Disabled User",
      email: "disabled@example.test",
      password: await bcrypt.hash("password", 12),
    });
    const token = createToken(user);
    await User.updateOne({ _id: user._id }, { $set: { isActive: false } });

    const response = await request(app)
      .get("/me")
      .set("Authorization", `Bearer ${token}`);
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: user.email, password: "password" });

    expect(response.status).toBe(401);
    expect(loginResponse.status).toBe(401);
  });

  test("preserves staff and admin authorization", async () => {
    const staff = await User.create({
      name: "Staff",
      email: "staff@example.test",
      password: "password",
      role: "staff",
    });
    const admin = await User.create({
      name: "Admin",
      email: "admin@example.test",
      password: "password",
      role: "admin",
    });

    const [staffResponse, adminResponse, staffAdminResponse] =
      await Promise.all([
        request(app)
          .get("/staff")
          .set("Authorization", `Bearer ${createToken(staff)}`),
        request(app)
          .get("/admin")
          .set("Authorization", `Bearer ${createToken(admin)}`),
        request(app)
          .get("/admin")
          .set("Authorization", `Bearer ${createToken(staff)}`),
      ]);

    expect(staffResponse.status).toBe(200);
    expect(adminResponse.status).toBe(200);
    expect(staffAdminResponse.status).toBe(403);
  });
});
