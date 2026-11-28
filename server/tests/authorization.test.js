jest.mock("../models/Organization", () => ({
  findOne: jest.fn(),
}));
jest.mock("../models/Service", () => ({
  findOne: jest.fn(),
}));

const Organization = require("../models/Organization");
const Service = require("../models/Service");
const {
  canManageOrganization,
  canManageService,
  canManageQueue,
} = require("../utils/authorization");

const mockFindOne = (model, result) => {
  const select = jest.fn().mockResolvedValue(result);
  model.findOne.mockReturnValue({ select });
  return select;
};

describe("shared authorization helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("allows an admin who owns the active organization", async () => {
    const select = mockFindOne(Organization, {
      owner: { toString: () => "admin-id" },
      staff: [],
    });

    await expect(
      canManageOrganization("organization-id", {
        role: "admin",
        userId: "admin-id",
      })
    ).resolves.toBe(true);

    expect(Organization.findOne).toHaveBeenCalledWith({
      _id: "organization-id",
      isActive: true,
    });
    expect(select).toHaveBeenCalledWith("owner staff");
  });

  test("allows staff assigned to the service's organization", async () => {
    mockFindOne(Organization, {
      owner: "admin-id",
      staff: [{ toString: () => "staff-id" }],
    });

    await expect(
      canManageService(
        { organization: "organization-id" },
        { role: "staff", userId: "staff-id" }
      )
    ).resolves.toBe(true);

    expect(Organization.findOne).toHaveBeenCalledWith({
      _id: "organization-id",
      isActive: true,
    });
  });

  test("denies users without a matching owner or staff assignment", async () => {
    mockFindOne(Organization, {
      owner: "admin-id",
      staff: ["assigned-staff-id"],
    });

    await expect(
      canManageOrganization("organization-id", {
        role: "staff",
        userId: "other-staff-id",
      })
    ).resolves.toBe(false);
  });

  test("denies access when the organization is missing or inactive", async () => {
    mockFindOne(Organization, null);

    await expect(
      canManageOrganization("organization-id", {
        role: "admin",
        userId: "admin-id",
      })
    ).resolves.toBe(false);
  });

  test("denies queue access when its service is missing or inactive", async () => {
    const select = mockFindOne(Service, null);

    await expect(
      canManageQueue(
        { service: "service-id" },
        { role: "admin", userId: "admin-id" }
      )
    ).resolves.toBe(false);

    expect(Service.findOne).toHaveBeenCalledWith({
      _id: "service-id",
      isActive: true,
    });
    expect(select).toHaveBeenCalledWith("organization");
    expect(Organization.findOne).not.toHaveBeenCalled();
  });

  test("propagates database errors", async () => {
    const databaseError = new Error("Database unavailable");
    const select = jest.fn().mockRejectedValue(databaseError);
    Service.findOne.mockReturnValue({ select });

    await expect(
      canManageQueue(
        { service: "service-id" },
        { role: "admin", userId: "admin-id" }
      )
    ).rejects.toBe(databaseError);
  });
});
