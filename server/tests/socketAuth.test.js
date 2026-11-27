jest.mock("../models/User", () => ({
  findById: jest.fn(),
}));

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { createSocketAuthMiddleware } = require("../socket");

process.env.JWT_SECRET = "queueless-test-secret";

const userId = "64b64c6faad3e2d27cb1a123";

const createToken = (claims, options) =>
  jwt.sign(claims, process.env.JWT_SECRET, options);

const createSocket = (token) => ({
  handshake: {
    auth: token === undefined ? {} : { token },
  },
  data: {},
});

const mockUserLookup = (user) => {
  const lean = jest.fn().mockResolvedValue(user);
  const select = jest.fn().mockReturnValue({ lean });
  User.findById.mockReturnValue({ select });
  return { select, lean };
};

describe("Socket.IO JWT authentication", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("attaches the current database identity, not the JWT role", async () => {
    const user = {
      _id: { toString: () => userId },
      role: "customer",
      isActive: true,
    };
    const lookup = mockUserLookup(user);
    const socket = createSocket(
      createToken({ userId, role: "admin" })
    );
    const next = jest.fn();

    await createSocketAuthMiddleware()(socket, next);

    expect(lookup.select).toHaveBeenCalledWith("_id role isActive");
    expect(socket.data.user).toEqual({
      userId,
      role: "customer",
    });
    expect(next).toHaveBeenCalledWith();
  });

  test.each([
    ["missing", undefined],
    ["invalid", "not-a-jwt"],
    [
      "expired",
      createToken({ userId }, { expiresIn: -1 }),
    ],
  ])("rejects a %s JWT", async (_description, token) => {
    const socket = createSocket(token);
    const next = jest.fn();

    await createSocketAuthMiddleware()(socket, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(User.findById).not.toHaveBeenCalled();
  });

  test("rejects a malformed user ID before querying MongoDB", async () => {
    const socket = createSocket(
      createToken({ userId: "not-an-object-id" })
    );
    const next = jest.fn();

    await createSocketAuthMiddleware()(socket, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Invalid or expired token" })
    );
    expect(User.findById).not.toHaveBeenCalled();
  });

  test.each([
    ["deleted", null],
    [
      "inactive",
      {
        _id: { toString: () => userId },
        role: "staff",
        isActive: false,
      },
    ],
  ])("rejects a %s user", async (_description, user) => {
    mockUserLookup(user);
    const socket = createSocket(createToken({ userId }));
    const next = jest.fn();

    await createSocketAuthMiddleware()(socket, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(socket.data.user).toBeUndefined();
  });

  test("rejects and logs a MongoDB user lookup failure without the JWT", async () => {
    const lookupError = new Error("Database unavailable");
    const lean = jest.fn().mockRejectedValue(lookupError);
    const select = jest.fn().mockReturnValue({ lean });
    User.findById.mockReturnValue({ select });
    const token = createToken({ userId });
    const socket = createSocket(token);
    const next = jest.fn();
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await createSocketAuthMiddleware()(socket, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Unable to authenticate socket" })
    );
    expect(consoleError).toHaveBeenCalledWith(
      "Socket authentication lookup error:",
      lookupError.message
    );
    expect(consoleError.mock.calls.flat().join(" ")).not.toContain(token);
    consoleError.mockRestore();
  });
});
