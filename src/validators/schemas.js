"use strict";
const { z } = require("zod");

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(6).max(200),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const customerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  mobile: z.string().trim().max(20).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  idProof: z.string().max(120).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

const accountSchema = z.object({
  customer: objectId,
  accNo: z.string().trim().min(1).max(40),
  type: z.string().trim().min(1),
  balance: z.coerce.number().default(0),
  principal: z.coerce.number().default(0),
  interestRate: z.coerce.number().default(0),
  durationMonths: z.coerce.number().int().nonnegative().default(0),
  openedOn: z.string().or(z.date()).optional(),
});

const accountTypeSchema = z.object({
  name: z.string().trim().min(1).max(80),
  group: z.string().trim().min(1),
  hasInterest: z.boolean().default(false),
  interestRate: z.coerce.number().default(0),
  hasDuration: z.boolean().default(false),
  defaultDuration: z.coerce.number().int().nonnegative().default(0),
  isLoan: z.boolean().default(false),
});

const groupSchema = z.object({
  name: z.string().trim().min(1).max(80),
  type: z.enum(["Asset", "Liability", "Equity", "Income", "Expense"]),
});

const ledgerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  group: z.string().trim().min(1),
  balance: z.coerce.number().default(0),
  isCash: z.boolean().default(false),
});

const TX_TYPE_VALUES = [
  "deposit", "withdraw", "disburse", "repay_princ", "repay_int",
  "income", "expense", "agent_handover",
];

const transactionSchema = z.object({
  date: z.string().or(z.date()).optional(),
  type: z.enum(TX_TYPE_VALUES),
  amt: z.coerce.number().positive(),
  account: objectId.optional().or(z.literal("")).transform((v) => v || undefined),
  ledger: objectId.optional().or(z.literal("")).transform((v) => v || undefined),
  mode: z.enum(["cash", "bank", "online", "cheque"]).default("cash"),
  remarks: z.string().max(500).optional().default(""),
});

const agentCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
  mobile: z.string().max(20).optional().or(z.literal("")),
  commissionPct: z.coerce.number().min(0).max(100).default(0),
  assigned: z.array(objectId).default([]),
});

const agentUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  mobile: z.string().max(20).optional().or(z.literal("")),
  commissionPct: z.coerce.number().min(0).max(100).optional(),
  assigned: z.array(objectId).optional(),
  active: z.boolean().optional(),
});

const handoverSchema = z.object({
  agentId: objectId,
  amount: z.coerce.number().positive(),
  ledgerId: objectId.optional().or(z.literal("")).transform((v) => v || undefined),
  notes: z.string().max(500).optional().default(""),
});

const settingsSchema = z.object({
  orgName: z.string().max(120).optional(),
  orgAddress: z.string().max(300).optional(),
  orgPhone: z.string().max(40).optional(),
  currency: z.string().max(8).optional(),
  receiptFooter: z.string().max(300).optional(),
});

const idDeleteSchema = z.object({ id: objectId });

module.exports = {
  objectId,
  registerSchema, loginSchema,
  customerSchema, accountSchema, accountTypeSchema,
  groupSchema, ledgerSchema, transactionSchema,
  agentCreateSchema, agentUpdateSchema,
  handoverSchema, settingsSchema, idDeleteSchema,
  TX_TYPE_VALUES,
};
