const express = require("express");
const request = require("supertest");

const logger = require("../utils/logger");
const {
  errorHandler,
  notFoundHandler,
} = require("../middleware/errorHandler");

jest.spyOn(logger, "error").mockImplementation(() => {});

const createApp = (routeHandler) => {
  const app = express();
  app.use(express.json());
  app.get("/test", routeHandler);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};

describe("centralized error handling", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("returns a safe response for invalid JSON", async () => {
    const app = createApp((req, res) => res.sendStatus(200));

    const response = await request(app)
      .post("/test")
      .set("Content-Type", "application/json")
      .send('{"invalid":');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Invalid JSON request body",
    });
  });

  test("maps Mongoose validation errors without exposing internals", async () => {
    const app = createApp(() => {
      const error = new Error("database details");
      error.name = "ValidationError";
      error.errors = {
        email: { path: "email", kind: "required" },
      };
      throw error;
    });

    const response = await request(app).get("/test");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Database validation failed",
      errors: [{ field: "email", message: "required" }],
    });
    expect(JSON.stringify(response.body)).not.toContain("database details");
  });

  test("maps duplicate keys and invalid ObjectIds", async () => {
    const duplicateApp = createApp(() => {
      const error = new Error("secret index details");
      error.code = 11000;
      throw error;
    });
    const castApp = createApp(() => {
      const error = new Error("cast details");
      error.name = "CastError";
      throw error;
    });

    const [duplicateResponse, castResponse] = await Promise.all([
      request(duplicateApp).get("/test"),
      request(castApp).get("/test"),
    ]);

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body.message).toBe(
      "A resource with the same unique value already exists"
    );
    expect(castResponse.status).toBe(400);
    expect(castResponse.body.message).toBe("Invalid request parameter");
  });

  test("preserves safe unauthorized and forbidden responses", async () => {
    const unauthorizedApp = createApp(() => {
      const error = new Error("jwt internals");
      error.statusCode = 401;
      throw error;
    });
    const forbiddenApp = createApp(() => {
      const error = new Error("authorization internals");
      error.statusCode = 403;
      throw error;
    });

    const [unauthorizedResponse, forbiddenResponse] = await Promise.all([
      request(unauthorizedApp).get("/test"),
      request(forbiddenApp).get("/test"),
    ]);

    expect(unauthorizedResponse.body).toEqual({
      message: "Authentication required",
    });
    expect(forbiddenResponse.body).toEqual({
      message: "Access denied",
    });
  });

  test("returns a safe 404 for unknown routes", async () => {
    const app = express();
    app.use(notFoundHandler);
    app.use(errorHandler);

    const response = await request(app).get("/missing");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "API route not found",
    });
  });

  test("logs and hides unexpected internal errors", async () => {
    const app = createApp(() => {
      throw new Error("database password and stack details");
    });

    const response = await request(app).get("/test");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Internal server error",
    });
    expect(JSON.stringify(response.body)).not.toContain("database password");
    expect(logger.error).toHaveBeenCalledWith(
      "Unhandled API error",
      expect.objectContaining({
        method: "GET",
        path: "/test",
        status: 500,
        errorName: "Error",
      })
    );
  });
});
