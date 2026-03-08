import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { resourceFromAttributes } = require("@opentelemetry/resources");

const SERVICE_NAME = "notification-service";
const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    "service.name": SERVICE_NAME,
  }),
  traceExporter: new OTLPTraceExporter({
    url: "http://alloy:4317", // push lên Alloy, Alloy forward sang Tempo
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-winston": {
        enabled: false,
      },
    }),
  ],
});

sdk.start();
console.log(`Khởi động OpenTelemetry Tracing cho ${SERVICE_NAME}`);
