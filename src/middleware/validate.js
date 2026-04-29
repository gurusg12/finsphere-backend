"use strict";
const ApiError = require("../utils/ApiError");

// Generic zod validator factory.
// Usage: router.post("/x", validate(schema), handler)
// Validates `req.body` by default; pass `source` to validate query/params.
function validate(schema, source = "body") {
  return (req, _res, next) => {
    const data = req[source];
    const r = schema.safeParse(data);
    if (!r.success) {
      const details = r.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
      return next(ApiError.badRequest("Validation failed", details));
    }
    req[source] = r.data;
    next();
  };
}

module.exports = { validate };
