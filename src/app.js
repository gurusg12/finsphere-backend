"use strict";
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const env = require("./config/env");
const { attachUser } = require("./middleware/auth");
const { notFound, errorHandler } = require("./middleware/error");
const { apiLimiter } = require("./middleware/rateLimit");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin(origin, cb) {
      // Allow same-origin / curl / server-to-server (no origin) and listed origins.
      if (!origin) return cb(null, true);
      if (env.CORS_ORIGIN.includes("*") || env.CORS_ORIGIN.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

if (!env.isProd) app.use(morgan("dev"));
else app.use(morgan("combined"));

app.use("/api", apiLimiter);
app.use(attachUser);

app.get("/api/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/customers", require("./routes/customers"));
app.use("/api/accounts", require("./routes/accounts"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/settings", require("./routes/settings"));
app.use("/api/reports", require("./routes/reports"));

// Master data — exposed at multiple paths to mirror original Next API surface
app.use("/api", require("./routes/master"));     // /api/groups, /api/account-types, /api/ledgers
app.use("/api", require("./routes/agents"));     // /api/agents, /api/handovers

app.use(notFound);
app.use(errorHandler);

module.exports = app;
