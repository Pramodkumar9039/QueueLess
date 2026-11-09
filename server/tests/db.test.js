jest.mock("mongoose", () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  connection: {
    db: {
      admin: jest.fn(),
    },
  },
}));

const mongoose = require("mongoose");
const connectDB = require("../config/db");

describe("MongoDB transaction deployment validation", () => {
  let command;

  beforeEach(() => {
    jest.clearAllMocks();
    command = jest.fn();
    mongoose.connection.db.admin.mockReturnValue({ command });
  });

  test("accepts a replica-set deployment", async () => {
    command.mockResolvedValue({ setName: "queueless-replset" });

    await expect(connectDB()).resolves.toBeUndefined();

    expect(mongoose.connect).toHaveBeenCalledWith(
      process.env.MONGO_URI
    );
    expect(command).toHaveBeenCalledWith({ hello: 1 });
    expect(mongoose.disconnect).not.toHaveBeenCalled();
  });

  test("accepts a sharded deployment", async () => {
    command.mockResolvedValue({ msg: "isdbgrid" });

    await expect(connectDB()).resolves.toBeUndefined();
    expect(mongoose.disconnect).not.toHaveBeenCalled();
  });

  test("rejects a standalone deployment without fallback", async () => {
    command.mockResolvedValue({
      isWritablePrimary: true,
      maxWireVersion: 25,
    });

    await expect(connectDB()).rejects.toThrow(
      "MongoDB transaction support is required"
    );
    expect(mongoose.disconnect).toHaveBeenCalledTimes(1);
  });
});
