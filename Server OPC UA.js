import express from "express";
import cors from "cors";
import {
  OPCUAClient,
  AttributeIds,
  MessageSecurityMode,
  SecurityPolicy,
} from "node-opcua";

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- CONFIG ----------------
const HTTP_PORT = 5000;
const PLC_IP = "192.168.111.1";
const OPC_ENDPOINT = `opc.tcp://${PLC_IP}:4840`;

// ---------- OPC UA CLIENT SETUP ----------
const client = OPCUAClient.create({
  applicationName: "VirtualHMI_Client",
  securityMode: MessageSecurityMode.None,
  securityPolicy: SecurityPolicy.None,
  endpointMustExist: false,
  connectionStrategy: {
    initialDelay: 1000,
    maxRetry: 10,
  },
});

let session = null;

// ---------------- TAG → NodeId MAP ----------------
// NOTE: ns=3 is common on Siemens, but if you get BadNodeIdUnknown,
// change ns=3 to the namespace you see in UAExpert.
const OPC_TAGS = {
  // ---- Commands / Basic ----
  V_Counter_Reset: 'ns=3;s="V_HMI_DB"."V_Counter_Reset"',
  V_Start: 'ns=3;s="V_HMI_DB"."V_Start"',
  V_Stop: 'ns=3;s="V_HMI_DB"."V_Stop"',
  V_E_Stop: 'ns=3;s="V_HMI_DB"."V_E_Stop"',
  V_Reset: 'ns=3;s="V_HMI_DB"."V_Reset"',

  // ---- Counters ----
  V_num_1: 'ns=3;s="V_HMI_DB"."V_num_1"',
  V_num_2: 'ns=3;s="V_HMI_DB"."V_num_2"',
  V_num_3: 'ns=3;s="V_HMI_DB"."V_num_3"',
  V_Module_Total: 'ns=3;s="V_HMI_DB"."V_Module_Total"',

  // ---- Percent (quoted names in DB) ----
  V_S1_percent: 'ns=3;s="V_HMI_DB"."V_S1_%"',
  V_S2_percent: 'ns=3;s="V_HMI_DB"."V_S2_%"',
  V_S3_percent: 'ns=3;s="V_HMI_DB"."V_S3_%"',

  // ---- Outputs / Status ----
  V_P1_ON: 'ns=3;s="V_HMI_DB"."V_P1_ON"',
  V_P2_ON: 'ns=3;s="V_HMI_DB"."V_P2_ON"',
  V_P3_ON: 'ns=3;s="V_HMI_DB"."V_P3_ON"',
  V_Main_Conv_ON: 'ns=3;s="V_HMI_DB"."V_Main_Conv_ON"',
  V_Sub_Conv_1_ON: 'ns=3;s="V_HMI_DB"."V_Sub_Conv_1_ON"',
  V_Sub_Conv_2_ON: 'ns=3;s="V_HMI_DB"."V_Sub_Conv_2_ON"',
  V_Sub_Conv_3_ON: 'ns=3;s="V_HMI_DB"."V_Sub_Conv_3_ON"',

  // ---- Module Enables ----
  V_Module_1: 'ns=3;s="V_HMI_DB"."V_Module_1"',
  V_Module_2: 'ns=3;s="V_HMI_DB"."V_Module_2"',
  V_Module_3: 'ns=3;s="V_HMI_DB"."V_Module_3"',

  // ---- Inputs / Analog ----
  V_Pnematic_Pressure: 'ns=3;s="V_HMI_DB"."V_Pnematic_Pressure"', // Real

  // ---- Faults ----
  V_Fault_Conv_Main: 'ns=3;s="V_HMI_DB"."V_Fault_Conv_Main"',
  V_Fault_Sub_Conv_1: 'ns=3;s="V_HMI_DB"."V_Fault_Sub_Conv_1"',
  V_Fault_Sub_Conv_2: 'ns=3;s="V_HMI_DB"."V_Fault_Sub_Conv_2"',
  V_Fault_Sub_Conv_3: 'ns=3;s="V_HMI_DB"."V_Fault_Sub_Conv_3"',

  V_Fault_P1_Back: 'ns=3;s="V_HMI_DB"."V_Fault_P1_Back"',
  V_Fault_P1_Front: 'ns=3;s="V_HMI_DB"."V_Fault_P1_Front"',
  V_Fault_P2_Back: 'ns=3;s="V_HMI_DB"."V_Fault_P2_Back"',
  V_Fault_P2_Front: 'ns=3;s="V_HMI_DB"."V_Fault_P2_Front"',
  V_Fault_P3_Back: 'ns=3;s="V_HMI_DB"."V_Fault_P3_Back"',
  V_Fault_P3_Front: 'ns=3;s="V_HMI_DB"."V_Fault_P3_Front"',

  // ---- Conveyor Speeds (Word) ----
  V_Conv_Main_Speed: 'ns=3;s="V_HMI_DB"."V_Conv_Main_Speed"',
  V_Conv_1_Speed: 'ns=3;s="V_HMI_DB"."V_Conv_1_Speed"',
  V_Conv_2_Speed: 'ns=3;s="V_HMI_DB"."V_Conv_2_Speed"',
  V_Conv_3_Speed: 'ns=3;s="V_HMI_DB"."V_Conv_3_Speed"',

  // ---- Module 1 Dimensions / Volume ----
  V_M1_Height: 'ns=3;s="V_HMI_DB"."V_M1_Height"',
  V_M1_Length: 'ns=3;s="V_HMI_DB"."V_M1_Length"',
  V_M1_Width: 'ns=3;s="V_HMI_DB"."V_M1_Width"',
  V_M1_Volume: 'ns=3;s="V_HMI_DB"."V_M1_Volume"',

  // ---- Module 2 Dimensions / Volume ----
  V_M2_Height: 'ns=3;s="V_HMI_DB"."V_M2_Height"',
  V_M2_Length: 'ns=3;s="V_HMI_DB"."V_M2_Length"',
  V_M2_Width: 'ns=3;s="V_HMI_DB"."V_M2_Width"',
  V_M2_Volume: 'ns=3;s="V_HMI_DB"."V_M2_Volume"',

  // ---- Module 3 Dimensions / Volume ----
  V_M3_Height: 'ns=3;s="V_HMI_DB"."V_M3_Height"',
  V_M3_Length: 'ns=3;s="V_HMI_DB"."V_M3_Length"',
  V_M3_Width: 'ns=3;s="V_HMI_DB"."V_M3_Width"',
  V_M3_Volume: 'ns=3;s="V_HMI_DB"."V_M3_Volume"',

  // ---- Volume Switch ----
  V_Volume_Switch: 'ns=3;s="V_HMI_DB"."V_Volume_Switch"',
};

// ---- Tag Types (for writing correct datatype) ----
const OPC_TAG_TYPES = {
  V_Counter_Reset: "Boolean",
  V_Start: "Boolean",
  V_Stop: "Boolean",
  V_E_Stop: "Boolean",
  V_Reset: "Boolean",

  V_num_1: "Int32", // DInt
  V_num_2: "Int32",
  V_num_3: "Int32",
  V_Module_Total: "Int32",

  V_S1_percent: "Float", // Real
  V_S2_percent: "Float",
  V_S3_percent: "Float",

  V_P1_ON: "Boolean",
  V_P2_ON: "Boolean",
  V_P3_ON: "Boolean",
  V_Main_Conv_ON: "Boolean",
  V_Sub_Conv_1_ON: "Boolean",
  V_Sub_Conv_2_ON: "Boolean",
  V_Sub_Conv_3_ON: "Boolean",

  V_Module_1: "Boolean",
  V_Module_2: "Boolean",
  V_Module_3: "Boolean",

  V_Pnematic_Pressure: "Float",

  V_Fault_Conv_Main: "Boolean",
  V_Fault_Sub_Conv_1: "Boolean",
  V_Fault_Sub_Conv_2: "Boolean",
  V_Fault_Sub_Conv_3: "Boolean",

  V_Fault_P1_Back: "Boolean",
  V_Fault_P1_Front: "Boolean",
  V_Fault_P2_Back: "Boolean",
  V_Fault_P2_Front: "Boolean",
  V_Fault_P3_Back: "Boolean",
  V_Fault_P3_Front: "Boolean",

  // =========================
  // ✅ NEW TAG TYPES ADDED
  // =========================

  // ---- Conveyor Speeds (Word) ----
  V_Conv_Main_Speed: "UInt16",
  V_Conv_1_Speed: "UInt16",
  V_Conv_2_Speed: "UInt16",
  V_Conv_3_Speed: "UInt16",

  // ---- Module Dimensions (Int) ----
  V_M1_Height: "Int16",
  V_M1_Length: "Int16",
  V_M1_Width: "Int16",

  V_M2_Height: "Int16",
  V_M2_Length: "Int16",
  V_M2_Width: "Int16",

  V_M3_Height: "Int16",
  V_M3_Length: "Int16",
  V_M3_Width: "Int16",

  // ---- Volumes (DInt) ----
  V_M1_Volume: "Int32",
  V_M2_Volume: "Int32",
  V_M3_Volume: "Int32",

  // ---- Volume Switch (Bool) ----
  V_Volume_Switch: "Boolean",
};

// -------------- CONNECT / RECONNECT --------------
async function ensureSession() {
  if (session) return session;

  try {
    console.log("🔌 Connecting OPC UA →", OPC_ENDPOINT);
    await client.connect(OPC_ENDPOINT);
    session = await client.createSession(); // anonymous
    console.log("✅ OPC UA session created");
    return session;
  } catch (err) {
    console.error("❌ OPC UA connect error:", err.message || err);
    session = null;
    throw err;
  }
}

// -------------- READ ONE TAG --------------
async function readOpcTag(tagName) {
  const nodeId = OPC_TAGS[tagName];
  if (!nodeId) throw new Error("Unknown tag: " + tagName);

  const s = await ensureSession();
  const dataValue = await s.read({
    nodeId,
    attributeId: AttributeIds.Value,
  });

  if (dataValue.statusCode && dataValue.statusCode.name !== "Good") {
    throw new Error("OPC status: " + dataValue.statusCode.toString());
  }

  return dataValue.value.value;
}

// -------------- WRITE (AUTO TYPE) --------------
function coerceValue(opcType, value) {
  switch (opcType) {
    case "Boolean":
      return !!value;

    case "Int16": {
      const n = Number.parseInt(value, 10);
      const safe = Number.isFinite(n) ? n : 0;
      return Math.max(-32768, Math.min(32767, safe));
    }

    case "Int32": {
      const n = Number.parseInt(value, 10);
      return Number.isFinite(n) ? n : 0;
    }

    case "UInt16": {
      const n = Number.parseInt(value, 10);
      const safe = Number.isFinite(n) ? n : 0;
      return Math.max(0, Math.min(65535, safe));
    }

    case "Float": {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0.0;
    }

    default:
      return value;
  }
}

async function writeOpcTag(tagName, value) {
  const nodeId = OPC_TAGS[tagName];
  if (!nodeId) throw new Error("Unknown tag: " + tagName);

  const opcType = OPC_TAG_TYPES[tagName];
  if (!opcType) throw new Error("Missing OPC type for tag: " + tagName);

  const s = await ensureSession();

  const variant = {
    dataType: opcType,
    value: coerceValue(opcType, value),
  };

  const statusCode = await s.write({
    nodeId,
    attributeId: AttributeIds.Value,
    value: { value: variant },
  });

  if (statusCode.name !== "Good") {
    throw new Error("OPC write status: " + statusCode.toString());
  }
  return true;
}

// ---------------- EXPRESS ROUTES ----------------
app.get("/", (req, res) => res.send("✅ OPC UA Middleware OK"));

app.get("/health", async (req, res) => {
  try {
    await ensureSession();
    res.json({ connected: true });
  } catch (e) {
    res.json({ connected: false, error: e.toString() });
  }
});

// Read single tag
app.get("/read/:tag", async (req, res) => {
  const name = req.params.tag;
  try {
    const value = await readOpcTag(name);
    res.json({ tag: name, value });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// Read all tags
app.get("/read", async (req, res) => {
  const result = {};
  for (const name of Object.keys(OPC_TAGS)) {
    try {
      result[name] = await readOpcTag(name);
    } catch (e) {
      result[name] = "ERR: " + e.toString();
    }
  }
  res.json(result);
});

// Write tag (AUTO type based on OPC_TAG_TYPES)
app.post("/write", async (req, res) => {
  const { tag, value } = req.body;
  try {
    // Handle reset logic
    if (tag === "V_Stop" && value === true) {
      // When V_Stop is false, reset V_Start to false
      await writeOpcTag("V_Start", false);
    } else if (tag === "V_E_Stop" && value === true) {
      // When V_E_Stop is false, reset both V_Start and V_Stop to false
      await writeOpcTag("V_Start", false);
      await writeOpcTag("V_Stop", false);
    }
    await writeOpcTag(tag, value);

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// ---------------- START SERVER ----------------
app.listen(HTTP_PORT, () =>
  console.log(`🌍 OPC UA server running → http://localhost:${HTTP_PORT}`)
);
