import assert from "node:assert/strict";
import test from "node:test";
import schema from "../src/appmeta/settings.json" with { type: "json" };
import { AppModel } from "../src/model.ts";
import { schemaDefaults, type Settings } from "../src/lib.ts";
const NOW = 1700000000000;
const make = (values: Settings = {}, saved: Settings = {}, now = NOW) =>
  new AppModel({ ...schemaDefaults(schema.fields), ...values }, saved, now);

test("activation requires confirmation and suppresses duplicate requests", () => {
  const a = make({ source_url: "https://ha.example" });
  a.key("ok", 0, NOW);
  assert.equal(a.pendingCommand, undefined);
  a.key("ok", 0, NOW);
  const request = a.pendingCommand;
  a.key("ok", 0, NOW);
  assert.equal(a.pendingCommand, request);
  assert.ok(request);
});
test("Back cancels without sending and rejection never shows success", () => {
  const a = make();
  a.key("ok", 0, NOW);
  assert.equal(a.key("back", 0, NOW), true);
  assert.equal(a.pendingCommand, undefined);
  assert.throws(() => a.receive({ result: "failed" }, NOW));
  assert.notEqual(a.message, "Scene activated");
});
