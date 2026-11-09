const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

process.env.MONGOMS_VERSION = "7.0.14";

const { MongoMemoryReplSet } = require("mongodb-memory-server");
const os = require("os");

jest.setTimeout(120000);

process.env.JWT_SECRET = "queueless-test-secret";

const Token = require("../models/Token");
const Queue = require("../models/Queue");
const User = require("../models/User");
const Service = require("../models/Service");
const Organization = require("../models/Organization");
const tokenRoutes = require("../routes/tokenRoutes");
const queueRoutes = require("../routes/queueRoutes");

const app = express();
app.use(express.json());
app.use("/api/tokens", tokenRoutes);
app.use("/api/queues", queueRoutes);

let replSet;
let organization;
let service;
let queue;
let staff;
let admin;
let unassignedStaff;
let customerOne;
let customerTwo;
let customerThree;

const authHeader = (user) =>
  `Bearer ${jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET
  )}`;

const createQueue = async (status = "open") =>
  Queue.create({
    service: service._id,
    date: `${Date.now()}-${Math.random()}`,
    status,
  });

const createWaitingToken = (customer, targetQueue = queue, tokenNumber) =>
  Token.create({
    queue: targetQueue._id,
    customer: customer._id,
    tokenNumber,
    status: "waiting",
  });

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
  await Promise.all([
    User.init(),
    Organization.init(),
    Service.init(),
    Queue.init(),
    Token.init(),
  ]);

  [staff, admin, unassignedStaff, customerOne, customerTwo, customerThree] =
    await User.create([
      {
        name: "Assigned Staff",
        email: "assigned@example.test",
        password: "password",
        role: "staff",
      },
      {
        name: "Organization Admin",
        email: "admin@example.test",
        password: "password",
        role: "admin",
      },
      {
        name: "Unassigned Staff",
        email: "unassigned@example.test",
        password: "password",
        role: "staff",
      },
      {
        name: "Customer One",
        email: "customer-one@example.test",
        password: "password",
        role: "customer",
      },
      {
        name: "Customer Two",
        email: "customer-two@example.test",
        password: "password",
        role: "customer",
      },
      {
        name: "Customer Three",
        email: "customer-three@example.test",
        password: "password",
        role: "customer",
      },
    ]);

  organization = await Organization.create({
    name: "Test Organization",
    type: "clinic",
    address: "Test Address",
    owner: admin._id,
    staff: [staff._id],
  });

  service = await Service.create({
    name: "Test Service",
    estimatedDuration: 15,
    organization: organization._id,
  });

  queue = await createQueue();
});

afterEach(async () => {
  await Token.deleteMany({});
  await Queue.deleteMany({});
  queue = await createQueue();
});

afterAll(async () => {
  await mongoose.disconnect();
  await replSet.stop();
});

describe("token concurrency and authorization", () => {
  test("promotes the earliest waiting token", async () => {
    await createWaitingToken(customerOne, queue, 2);
    await createWaitingToken(customerTwo, queue, 1);

    const response = await request(app)
      .post(`/api/tokens/queue/${queue._id}/call-next`)
      .set("Authorization", authHeader(staff));

    expect(response.status).toBe(200);
    expect(response.body.token.tokenNumber).toBe(1);

    const serving = await Token.find({ queue: queue._id, status: "serving" });
    expect(serving).toHaveLength(1);
    expect(serving[0].tokenNumber).toBe(1);
  });

  test("returns 409 while another token is serving", async () => {
    const serving = await createWaitingToken(customerOne, queue, 1);
    await createWaitingToken(customerTwo, queue, 2);
    serving.status = "serving";
    await serving.save();

    const response = await request(app)
      .post(`/api/tokens/queue/${queue._id}/call-next`)
      .set("Authorization", authHeader(staff));

    expect(response.status).toBe(409);
    expect(response.body.token._id).toBe(serving._id.toString());
    expect(await Token.countDocuments({ status: "serving" })).toBe(1);
  });

  test("completes a serving token and calls the next token", async () => {
    const serving = await createWaitingToken(customerOne, queue, 1);
    await createWaitingToken(customerTwo, queue, 2);
    serving.status = "serving";
    await serving.save();

    const completeResponse = await request(app)
      .patch(`/api/tokens/${serving._id}/complete`)
      .set("Authorization", authHeader(staff));

    expect(completeResponse.status).toBe(200);
    expect(completeResponse.body.token.status).toBe("completed");

    const nextResponse = await request(app)
      .post(`/api/tokens/queue/${queue._id}/call-next`)
      .set("Authorization", authHeader(staff));

    expect(nextResponse.status).toBe(200);
    expect(nextResponse.body.token.tokenNumber).toBe(2);
  });

  test("allows only one concurrent call-next request to commit serving status", async () => {
    await createWaitingToken(customerOne, queue, 1);
    await createWaitingToken(customerTwo, queue, 2);

    const responses = await Promise.all(
      Array.from({ length: 4 }, () =>
        request(app)
          .post(`/api/tokens/queue/${queue._id}/call-next`)
          .set("Authorization", authHeader(staff))
      )
    );

    const statuses = responses.map((response) => response.status).sort();
    const servingCount = await Token.countDocuments({
      queue: queue._id,
      status: "serving",
    });

    expect(servingCount).toBe(1);
    expect(statuses).toEqual([200, 409, 409, 409]);
    expect(statuses).not.toContain(404);
    expect(statuses).not.toContain(500);
  });

  test("rejects active-token creation for a customer who is active elsewhere", async () => {
    const otherQueue = await createQueue();

    const firstResponse = await request(app)
      .post("/api/tokens")
      .set("Authorization", authHeader(customerOne))
      .send({ queueId: queue._id.toString() });

    const secondResponse = await request(app)
      .post("/api/tokens")
      .set("Authorization", authHeader(customerOne))
      .send({ queueId: otherQueue._id.toString() });

    expect(firstResponse.status).toBe(201);
    expect(secondResponse.status).toBe(409);
    expect(
      await Token.countDocuments({
        customer: customerOne._id,
        status: { $in: ["waiting", "serving"] },
      })
    ).toBe(1);
  });

  test("prevents concurrent active tokens and preserves unique queue numbers", async () => {
    const otherQueue = await createQueue();

    const [sameCustomerA, sameCustomerB] = await Promise.all([
      request(app)
        .post("/api/tokens")
        .set("Authorization", authHeader(customerOne))
        .send({ queueId: queue._id.toString() }),
      request(app)
        .post("/api/tokens")
        .set("Authorization", authHeader(customerOne))
        .send({ queueId: otherQueue._id.toString() }),
    ]);

    expect([sameCustomerA.status, sameCustomerB.status].sort()).toEqual([
      201,
      409,
    ]);
    expect(
      await Token.countDocuments({
        customer: customerOne._id,
        status: { $in: ["waiting", "serving"] },
      })
    ).toBe(1);

    const [customerTwoResponse, customerThreeResponse] = await Promise.all([
      request(app)
        .post("/api/tokens")
        .set("Authorization", authHeader(customerTwo))
        .send({ queueId: queue._id.toString() }),
      request(app)
        .post("/api/tokens")
        .set("Authorization", authHeader(customerThree))
        .send({ queueId: queue._id.toString() }),
    ]);

    expect(customerTwoResponse.status).toBe(201);
    expect(customerThreeResponse.status).toBe(201);
    const queueTokens = await Token.find({ queue: queue._id }).select(
      "tokenNumber"
    );
    expect(new Set(queueTokens.map((token) => token.tokenNumber)).size).toBe(
      queueTokens.length
    );
  });

  test("does not promote a token on a paused or closed queue", async () => {
    const pausedQueue = await createQueue("paused");
    const closedQueue = await createQueue("closed");
    await createWaitingToken(customerOne, pausedQueue, 1);
    await createWaitingToken(customerTwo, closedQueue, 1);

    const [pausedResponse, closedResponse] = await Promise.all([
      request(app)
        .post(`/api/tokens/queue/${pausedQueue._id}/call-next`)
        .set("Authorization", authHeader(staff)),
      request(app)
        .post(`/api/tokens/queue/${closedQueue._id}/call-next`)
        .set("Authorization", authHeader(staff)),
    ]);

    expect(pausedResponse.status).toBe(409);
    expect(closedResponse.status).toBe(409);
    expect(
      await Token.countDocuments({
        status: "serving",
        queue: { $in: [pausedQueue._id, closedQueue._id] },
      })
    ).toBe(0);
  });

  test("coordinates a pause race without violating serving-token uniqueness", async () => {
    queue = await Queue.create({
      service: service._id,
      date: new Date().toISOString().slice(0, 10),
      status: "open",
    });
    await createWaitingToken(customerOne, queue, 1);

    const [pauseResponse, callResponse] = await Promise.all([
      request(app)
        .patch(`/api/queues/service/${service._id}/status`)
        .set("Authorization", authHeader(staff))
        .send({ status: "paused" }),
      request(app)
        .post(`/api/tokens/queue/${queue._id}/call-next`)
        .set("Authorization", authHeader(staff)),
    ]);

    const finalQueue = await Queue.findById(queue._id);
    const servingCount = await Token.countDocuments({
      queue: queue._id,
      status: "serving",
    });

    expect(pauseResponse.status).toBe(200);
    expect([200, 409]).toContain(callResponse.status);
    expect(servingCount).toBeLessThanOrEqual(1);
    expect(finalQueue.status).toBe("paused");
  });

  test("rejects call-next after the pause request completes", async () => {
    queue = await Queue.create({
      service: service._id,
      date: new Date().toISOString().slice(0, 10),
      status: "open",
    });
    await createWaitingToken(customerOne, queue, 1);

    const pauseResponse = await request(app)
      .patch(`/api/queues/service/${service._id}/status`)
      .set("Authorization", authHeader(staff))
      .send({ status: "paused" });
    const callResponse = await request(app)
      .post(`/api/tokens/queue/${queue._id}/call-next`)
      .set("Authorization", authHeader(staff));

    expect(pauseResponse.status).toBe(200);
    expect(callResponse.status).toBe(409);
    expect(
      await Token.countDocuments({
        queue: queue._id,
        status: "serving",
      })
    ).toBe(0);
  });

  test("promotes a token before pausing when call-next completes first", async () => {
    queue = await Queue.create({
      service: service._id,
      date: new Date().toISOString().slice(0, 10),
      status: "open",
    });
    await createWaitingToken(customerOne, queue, 1);

    const callResponse = await request(app)
      .post(`/api/tokens/queue/${queue._id}/call-next`)
      .set("Authorization", authHeader(staff));
    const servingCountBeforePause = await Token.countDocuments({
      queue: queue._id,
      status: "serving",
    });
    const pauseResponse = await request(app)
      .patch(`/api/queues/service/${service._id}/status`)
      .set("Authorization", authHeader(staff))
      .send({ status: "paused" });
    const finalQueue = await Queue.findById(queue._id);

    expect(callResponse.status).toBe(200);
    expect(servingCountBeforePause).toBe(1);
    expect(pauseResponse.status).toBe(200);
    expect(finalQueue.status).toBe("paused");
  });

  test("preserves authorization boundaries", async () => {
    await createWaitingToken(customerOne, queue, 1);

    const noJwt = await request(app).post(
      `/api/tokens/queue/${queue._id}/call-next`
    );
    const invalidJwt = await request(app)
      .post(`/api/tokens/queue/${queue._id}/call-next`)
      .set("Authorization", "Bearer invalid");
    const customerResponse = await request(app)
      .post(`/api/tokens/queue/${queue._id}/call-next`)
      .set("Authorization", authHeader(customerThree));
    const unassignedResponse = await request(app)
      .post(`/api/tokens/queue/${queue._id}/call-next`)
      .set("Authorization", authHeader(unassignedStaff));
    const authorizedResponse = await request(app)
      .post(`/api/tokens/queue/${queue._id}/call-next`)
      .set("Authorization", authHeader(admin));

    expect(noJwt.status).toBe(401);
    expect(invalidJwt.status).toBe(401);
    expect(customerResponse.status).toBe(403);
    expect(unassignedResponse.status).toBe(403);
    expect(authorizedResponse.status).toBe(200);
  });

  test("preserves database invariants and excludes completed tokens from active uniqueness", async () => {
    await createWaitingToken(customerOne, queue, 1);
    await createWaitingToken(customerTwo, queue, 2);
    await Token.create({
      queue: queue._id,
      customer: customerThree._id,
      tokenNumber: 3,
      status: "completed",
    });
    await Token.create({
      queue: queue._id,
      customer: customerThree._id,
      tokenNumber: 4,
      status: "waiting",
    });

    await request(app)
      .post(`/api/tokens/queue/${queue._id}/call-next`)
      .set("Authorization", authHeader(staff));

    const duplicateNumbers = await Token.aggregate([
      { $match: { queue: queue._id } },
      { $group: { _id: "$tokenNumber", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ]);
    const servingByQueue = await Token.aggregate([
      { $match: { status: "serving" } },
      { $group: { _id: "$queue", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ]);
    const activeByCustomer = await Token.aggregate([
      { $match: { status: { $in: ["waiting", "serving"] } } },
      { $group: { _id: "$customer", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ]);

    expect(duplicateNumbers).toEqual([]);
    expect(servingByQueue).toEqual([]);
    expect(activeByCustomer).toEqual([]);
    expect(
      await Token.countDocuments({
        customer: customerThree._id,
        status: "completed",
      })
    ).toBe(1);
  });
});
