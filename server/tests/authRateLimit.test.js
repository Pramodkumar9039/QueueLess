const express = require("express");
const request = require("supertest");

const {
  createAuthRateLimiter,
} = require("../middleware/authRateLimit");

const createApp = (limit, windowMs, message) => {
  const app = express();
  app.post(
    "/auth",
    createAuthRateLimiter(limit, windowMs, message),
    (req, res) => {
      res.sendStatus(200);
    }
  );
  return app;
};

describe("authentication rate limits", () => {
  jest.setTimeout(30000);

  test("allows login requests below the configured limit", async () => {
    const app = createApp(
      10,
      15 * 60 * 1000,
      "Too many login attempts. Please try again later."
    );
    const responses = await Promise.all(
      Array.from({ length: 10 }, () => request(app).post("/auth"))
    );

    expect(responses.every((response) => response.status === 200)).toBe(true);
  });

  test("rejects login requests above the configured limit with JSON", async () => {
    const app = createApp(
      10,
      15 * 60 * 1000,
      "Too many login attempts. Please try again later."
    );
    const responses = await Promise.all(
      Array.from({ length: 11 }, () => request(app).post("/auth"))
    );
    const limited = responses.filter((response) => response.status === 429);

    expect(limited).toHaveLength(1);
    expect(limited[0].body).toEqual({
      message: "Too many login attempts. Please try again later.",
    });
  });

  test("allows registration requests below the configured limit", async () => {
    const app = createApp(
      5,
      60 * 60 * 1000,
      "Too many registration attempts. Please try again later."
    );
    const responses = await Promise.all(
      Array.from({ length: 5 }, () => request(app).post("/auth"))
    );

    expect(responses.every((response) => response.status === 200)).toBe(true);
  });

  test("rejects registration requests above the configured limit with JSON", async () => {
    const app = createApp(
      5,
      60 * 60 * 1000,
      "Too many registration attempts. Please try again later."
    );
    const responses = await Promise.all(
      Array.from({ length: 6 }, () => request(app).post("/auth"))
    );
    const limited = responses.filter((response) => response.status === 429);

    expect(limited).toHaveLength(1);
    expect(limited[0].body).toEqual({
      message: "Too many registration attempts. Please try again later.",
    });
  });
});
