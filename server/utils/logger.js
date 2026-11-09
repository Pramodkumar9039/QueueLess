const serializeErrorContext = (message, context) =>
  JSON.stringify({
    timestamp: new Date().toISOString(),
    level: "error",
    message,
    ...context,
  });

module.exports = {
  error(message, context = {}) {
    console.error(serializeErrorContext(message, context));
  },
};
