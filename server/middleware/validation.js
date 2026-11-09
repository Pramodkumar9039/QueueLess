const { body, param, validationResult } = require("express-validator");

const validateRequest = (validators, allowedBodyFields = null) => [
  ...validators,
  (req, res, next) => {
    const errors = validationResult(req).array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));

    const unknownFields = allowedBodyFields
      ? Object.keys(req.body || {})
          .filter((field) => !allowedBodyFields.includes(field))
          .map((field) => ({
            field,
            message: "Unexpected field",
          }))
      : [];

    const allErrors = [...errors, ...unknownFields];

    if (allErrors.length > 0) {
      return res.status(400).json({
        message: "Invalid request input",
        errors: allErrors,
      });
    }

    next();
  },
];

const requiredString = (field, label = field) =>
  body(field)
    .exists({ values: "falsy" })
    .withMessage(`${label} is required`)
    .bail()
    .isString()
    .withMessage(`${label} must be a string`)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(`${label} must not be empty`);

const optionalString = (field, label = field) =>
  body(field)
    .optional({ values: "null" })
    .isString()
    .withMessage(`${label} must be a string`)
    .bail()
    .trim();

const mongoIdParam = (field) =>
  validateRequest([
    param(field)
      .isMongoId()
      .withMessage(`Invalid ${field}`),
  ]);

const authBodyFields = ["name", "email", "password", "phone"];

const registrationValidation = validateRequest(
  [
    requiredString("name", "Name"),
    body("email")
      .exists({ values: "falsy" })
      .withMessage("Email is required")
      .bail()
      .isString()
      .withMessage("Email must be a string")
      .bail()
      .isEmail()
      .withMessage("Email must be valid"),
    body("password")
      .exists({ values: "falsy" })
      .withMessage("Password is required")
      .bail()
      .isString()
      .withMessage("Password must be a string")
      .bail()
      .isLength({ min: 8 })
      .withMessage("Password must contain at least 8 characters"),
    optionalString("phone", "Phone"),
  ],
  authBodyFields
);

const loginValidation = validateRequest(
  [
    body("email")
      .exists({ values: "falsy" })
      .withMessage("Email is required")
      .bail()
      .isString()
      .withMessage("Email must be a string")
      .bail()
      .isEmail()
      .withMessage("Email must be valid"),
    body("password")
      .exists({ values: "falsy" })
      .withMessage("Password is required")
      .bail()
      .isString()
      .withMessage("Password must be a string")
      .bail()
      .notEmpty()
      .withMessage("Password must not be empty"),
  ],
  ["email", "password"]
);

const organizationValidation = validateRequest(
  [
    requiredString("name", "Name"),
    body("type")
      .isString()
      .withMessage("Type must be a string")
      .bail()
      .isIn(["clinic", "salon", "college", "other"])
      .withMessage("Type must be valid"),
    requiredString("address", "Address"),
    optionalString("description", "Description"),
  ],
  ["name", "type", "address", "description"]
);

const serviceValidation = validateRequest(
  [
    requiredString("name", "Name"),
    optionalString("description", "Description"),
    body("estimatedDuration")
      .isInt({ min: 1 })
      .withMessage("Estimated duration must be a positive whole number"),
    body("organizationId")
      .isMongoId()
      .withMessage("Invalid organization ID"),
  ],
  ["name", "description", "estimatedDuration", "organizationId"]
);

const queueStatusValidation = validateRequest(
  [
    body("status")
      .isString()
      .withMessage("Status must be a string")
      .bail()
      .isIn(["open", "paused"])
      .withMessage("Status must be either open or paused"),
  ],
  ["status"]
);

const queueIdBodyValidation = validateRequest(
  [body("queueId").isMongoId().withMessage("A valid queue ID is required")],
  ["queueId"]
);

const userValidation = validateRequest(
  [
    requiredString("name", "Name"),
    body("email")
      .isEmail()
      .withMessage("Email must be valid"),
    body("password")
      .isString()
      .withMessage("Password must be a string")
      .bail()
      .isLength({ min: 8 })
      .withMessage("Password must contain at least 8 characters"),
    optionalString("phone", "Phone"),
  ],
  authBodyFields
);

const staffValidation = validateRequest(
  [
    ...userValidation.slice(0, -1),
    body("organizationId")
      .isMongoId()
      .withMessage("Invalid organization ID"),
  ],
  [...authBodyFields, "organizationId"]
);

const assignmentValidation = validateRequest(
  [
    body("staffUserId")
      .isMongoId()
      .withMessage("Invalid staff user ID"),
    body("organizationId")
      .isMongoId()
      .withMessage("Invalid organization ID"),
  ],
  ["staffUserId", "organizationId"]
);

module.exports = {
  assignmentValidation,
  loginValidation,
  mongoIdParam,
  organizationValidation,
  queueIdBodyValidation,
  queueStatusValidation,
  registrationValidation,
  serviceValidation,
  staffValidation,
  userValidation,
  validateRequest,
};
