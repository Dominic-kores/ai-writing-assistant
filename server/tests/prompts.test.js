import test from "node:test";
import assert from "node:assert/strict";

import {
  getPrompt,
  TEMPERATURES,
} from "../prompts.js";

import {
  transformSchema,
  parseGrammarOutput,
} from "../validation.js";

test("Returns the short summary prompt", () => {
  const prompt = getPrompt("summarize", {
    length: "short",
  });

  assert.ok(prompt.includes("2-3 sentences"));
});

test("Returns the correct translation prompt", () => {
  const prompt = getPrompt("translate", {
    language: "swahili",
  });

  assert.ok(prompt.includes("Kiswahili"));
});

test("Uses zero temperature for grammar correction", () => {
  assert.equal(TEMPERATURES["fix-grammar"], 0);
});

test("Rejects unsupported operations", () => {
  assert.throws(
    () => getPrompt("invalid-operation"),
    /Unsupported operation/
  );
});

test("Accepts a valid transformation request", () => {
  const result = transformSchema.safeParse({
    text: "Artificial intelligence in agriculture",
    operation: "expand",
    provider: "openai",
  });

  assert.equal(result.success, true);
});

test("Rejects empty source text", () => {
  const result = transformSchema.safeParse({
    text: "",
    operation: "summarize",
    provider: "openai",
  });

  assert.equal(result.success, false);
});

test("Rejects invalid providers", () => {
  const result = transformSchema.safeParse({
    text: "Hello world",
    operation: "expand",
    provider: "invalid-provider",
  });

  assert.equal(result.success, false);
});

test("Parses valid structured grammar output", () => {
  const result = parseGrammarOutput(
    JSON.stringify({
      correctedText: "The farmers were working.",
      changes: ["Changed was to were"],
    })
  );

  assert.equal(
    result.correctedText,
    "The farmers were working."
  );

  assert.equal(result.changes.length, 1);
});

test("Rejects invalid JSON grammar output", () => {
  assert.throws(
    () => parseGrammarOutput("Invalid JSON"),
    /invalid grammar response/
  );
});

test("Rejects missing grammar response fields", () => {
  assert.throws(
    () => parseGrammarOutput('{"text":"Hello"}'),
    /invalid grammar response/
  );
});