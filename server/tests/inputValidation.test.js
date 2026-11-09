const express = require("express");
const request = require("supertest");

const {
  loginValidation,
  mongoIdParam,
  organizationValidation,
  queueIdBodyValidation,
  registrationValidation,
  serviceValidation,
} = require("../middleware/validation");

const createValidationApp = (method, path, validation) => {
  const app = express();
  app.use(express.json());
  app[method](path, validation, (req, res) => {
    res.sendStatus(204);
  });
  return app;
};

describe("request input validation", () => {
  test("accepts valid registration and login inputs", async () => {
    const registrationApp = createValidationApp(
      "post",
      "/register",
      registrationValidation
    );
    const loginApp = createValidationApp("post", "/login", loginValidation);

    const [registrationResponse, loginResponse] = await Promise.all([
      request(registrationApp).post("/register").send({
        name: "Customer",
        email: "customer@example.com",
        password: "password123",
        phone: "555-0100",
      }),
      request(loginApp).post("/login").send({
        email: "customer@example.com",
        password: "password123",
      }),
    ]);

    expect(registrationResponse.status).toBe(204);
    expect(loginResponse.status).toBe(204);
  });

  test("rejects malformed auth input and unexpected fields", async () => {
    const app = createValidationApp(
      "post",
      "/register",
      registrationValidation
    );

    const response = await request(app).post("/register").send({
      name: 42,
      email: "not-an-email",
      password: "short",
      role: "admin",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid request input");
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "email" }),
        expect.objectContaining({ field: "password" }),
        expect.objectContaining({ field: "role", message: "Unexpected field" }),
      ])
    );
  });

  test("validates organization and service payloads", async () => {
    const organizationApp = createValidationApp(
      "post",
      "/organizations",
      organizationValidation
    );
    const serviceApp = createValidationApp(
      "post",
      "/services",
      serviceValidation
    );

    const [organizationResponse, serviceResponse] = await Promise.all([
      request(organizationApp).post("/organizations").send({
        name: "Clinic",
        type: "clinic",
        address: "123 Main Street",
      }),
      request(serviceApp).post("/services").send({
        name: "General Consultation",
        estimatedDuration: 15,
        organizationId: "507f1f77bcf86cd799439011",
      }),
    ]);

    expect(organizationResponse.status).toBe(204);
    expect(serviceResponse.status).toBe(204);
  });

  test("rejects invalid organization and service inputs", async () => {
    const organizationApp = createValidationApp(
      "post",
      "/organizations",
      organizationValidation
    );
    const serviceApp = createValidationApp(
      "post",
      "/services",
      serviceValidation
    );

    const [organizationResponse, serviceResponse] = await Promise.all([
      request(organizationApp).post("/organizations").send({
        name: "Clinic",
        type: "invalid",
        address: "123 Main Street",
      }),
      request(serviceApp).post("/services").send({
        name: "General Consultation",
        estimatedDuration: 0,
        organizationId: "not-an-id",
      }),
    ]);

    expect(organizationResponse.status).toBe(400);
    expect(serviceResponse.status).toBe(400);
  });

  test("validates token body and route ObjectIds", async () => {
    const tokenApp = createValidationApp(
      "post",
      "/tokens",
      queueIdBodyValidation
    );
    const queueApp = createValidationApp(
      "get",
      "/queues/:queueId",
      mongoIdParam("queueId")
    );

    const [tokenResponse, queueResponse] = await Promise.all([
      request(tokenApp)
        .post("/tokens")
        .send({ queueId: "507f1f77bcf86cd799439011" }),
      request(queueApp).get("/queues/not-an-id"),
    ]);

    expect(tokenResponse.status).toBe(204);
    expect(queueResponse.status).toBe(400);
    expect(queueResponse.body.message).toBe("Invalid request input");
  });
});
