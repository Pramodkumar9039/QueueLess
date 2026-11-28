const Organization = require("../models/Organization");
const Service = require("../models/Service");

const canManageOrganization = async (organizationId, user) => {
  const organization = await Organization.findOne({
    _id: organizationId,
    isActive: true,
  }).select("owner staff");

  if (!organization) {
    return false;
  }

  if (user.role === "admin") {
    return organization.owner.toString() === user.userId;
  }

  if (user.role === "staff") {
    return organization.staff.some(
      (staffId) => staffId.toString() === user.userId
    );
  }

  return false;
};

const canManageService = async (service, user) =>
  canManageOrganization(service.organization, user);

const canManageQueue = async (queue, user) => {
  const service = await Service.findOne({
    _id: queue.service,
    isActive: true,
  }).select("organization");

  if (!service) {
    return false;
  }

  return canManageOrganization(service.organization, user);
};

module.exports = {
  canManageOrganization,
  canManageService,
  canManageQueue,
};
