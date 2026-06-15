import assert from "node:assert/strict";
import test from "node:test";
import {
  SkenionNodeDefinitionError,
  defineNode,
  t
} from "../dist/index.js";

const scriptNodeBase = {
  id: "script.brightness",
  version: "0.1.0",
  displayName: "Brightness",
  category: "Script",
  execution: {
    model: "script_control"
  },
  state: {
    persistent: true
  },
  scriptApiVersion: "0.1.0",
  bundleHash: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
  capabilities: ["script.api.v0.1"]
};

test("defineNode returns a normalized valid manifest", () => {
  const manifest = defineNode({
    ...scriptNodeBase,
    ports: [
      {
        id: "enabled",
        direction: "input",
        type: t.value(t.bool()),
        activation: "latched",
        default: true
      },
      {
        id: "pulse",
        direction: "output",
        type: t.event(t.bang())
      }
    ]
  });

  assert.equal(manifest.schema, "skenion.node.definition");
  assert.equal(manifest.schemaVersion, "0.1.0");
  assert.equal(manifest.permissions.length, 0);
  assert.equal(manifest.ports[0].type.dataKind, "boolean");
  assert.equal(manifest.ports[1].type.flow, "event");
});

test("defineNode rejects duplicate port ids", () => {
  assert.throws(
    () =>
      defineNode({
        ...scriptNodeBase,
        ports: [
          {
            id: "value",
            direction: "input",
            type: t.value(t.f32())
          },
          {
            id: "value",
            direction: "output",
            type: t.value(t.f32())
          }
        ]
      }),
    SkenionNodeDefinitionError
  );
});

test("defineNode rejects activation on output ports", () => {
  assert.throws(
    () =>
      defineNode({
        ...scriptNodeBase,
        ports: [
          {
            id: "pulse",
            direction: "output",
            type: t.event(t.bang()),
            activation: "trigger"
          }
        ]
      }),
    SkenionNodeDefinitionError
  );
});

test("defineNode rejects unsupported permissions", () => {
  assert.throws(
    () =>
      defineNode({
        ...scriptNodeBase,
        permissions: ["network"],
        ports: [
          {
            id: "value",
            direction: "output",
            type: t.value(t.f32())
          }
        ]
      }),
    SkenionNodeDefinitionError
  );
});

test("type builders emit canonical v0.1 flow and dataKind pairs", () => {
  assert.deepEqual(t.event(t.bang()), {
    flow: "event",
    dataKind: "bang"
  });
  assert.deepEqual(t.value(t.bool()), {
    flow: "value",
    dataKind: "boolean"
  });
  assert.deepEqual(t.gpu.texture2d(), {
    flow: "resource",
    dataKind: "gpu.texture2d"
  });
  assert.deepEqual(t.resource(t.asset.video()), {
    flow: "resource",
    dataKind: "asset.video"
  });
});
