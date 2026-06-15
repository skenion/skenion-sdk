import type {
  DataTypeV01
} from "@skenion/contracts";

export type TypeConstraints = Omit<DataTypeV01, "flow" | "dataKind">;

export interface DataKindSpec extends TypeConstraints {
  dataKind: string;
}

export type TypeInput = DataKindSpec | DataTypeV01;

function kind(dataKind: string, constraints: TypeConstraints = {}): DataKindSpec {
  return {
    dataKind,
    ...constraints
  };
}

function withFlow(flow: DataTypeV01["flow"], input: TypeInput): DataTypeV01 {
  if ("flow" in input && input.flow !== flow) {
    throw new TypeError(`Cannot convert ${input.flow}<${input.dataKind}> to ${flow}<${input.dataKind}>`);
  }

  return {
    flow,
    ...input
  };
}

export const t = {
  f32: (constraints: TypeConstraints = {}) => kind("number.f32", constraints),
  f64: (constraints: TypeConstraints = {}) => kind("number.f64", constraints),
  bool: (constraints: TypeConstraints = {}) => kind("boolean", constraints),
  boolean: (constraints: TypeConstraints = {}) => kind("boolean", constraints),
  string: (constraints: TypeConstraints = {}) => kind("string", constraints),
  bang: (constraints: TypeConstraints = {}) => kind("bang", constraints),
  asset: {
    video: (constraints: TypeConstraints = {}) => kind("asset.video", constraints)
  },
  gpu: {
    texture2d: (constraints: TypeConstraints = {}) =>
      withFlow("resource", kind("gpu.texture2d", constraints))
  },
  value: (input: TypeInput) => withFlow("value", input),
  event: (input: TypeInput) => withFlow("event", input),
  signal: (input: TypeInput) => withFlow("signal", input),
  stream: (input: TypeInput) => withFlow("stream", input),
  resource: (input: TypeInput) => withFlow("resource", input)
} as const;
