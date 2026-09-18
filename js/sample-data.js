// Sample hardware components with realistic vector SVG illustrations and active loans

function createSvgDataUri(svgString) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

// Crisp Vector Graphics for Hardware Components
const COMPONENT_SVGS = {
  esp32: `<svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
    <rect width="240" height="180" fill="#080b11"/>
    <!-- PCB Board -->
    <rect x="50" y="20" width="140" height="140" rx="6" fill="#1b2838" stroke="#2a415e" stroke-width="2"/>
    <!-- Header Pins Left & Right -->
    <g fill="#d97706">
      <rect x="53" y="30" width="8" height="6" rx="1"/>
      <rect x="53" y="42" width="8" height="6" rx="1"/>
      <rect x="53" y="54" width="8" height="6" rx="1"/>
      <rect x="53" y="66" width="8" height="6" rx="1"/>
      <rect x="53" y="78" width="8" height="6" rx="1"/>
      <rect x="53" y="90" width="8" height="6" rx="1"/>
      <rect x="53" y="102" width="8" height="6" rx="1"/>
      <rect x="53" y="114" width="8" height="6" rx="1"/>
      <rect x="53" y="126" width="8" height="6" rx="1"/>
      <rect x="53" y="138" width="8" height="6" rx="1"/>
      <rect x="179" y="30" width="8" height="6" rx="1"/>
      <rect x="179" y="42" width="8" height="6" rx="1"/>
      <rect x="179" y="54" width="8" height="6" rx="1"/>
      <rect x="179" y="66" width="8" height="6" rx="1"/>
      <rect x="179" y="78" width="8" height="6" rx="1"/>
      <rect x="179" y="90" width="8" height="6" rx="1"/>
      <rect x="179" y="102" width="8" height="6" rx="1"/>
      <rect x="179" y="114" width="8" height="6" rx="1"/>
      <rect x="179" y="126" width="8" height="6" rx="1"/>
      <rect x="179" y="138" width="8" height="6" rx="1"/>
    </g>
    <!-- ESP32 RF Shield Can -->
    <rect x="75" y="32" width="90" height="70" rx="3" fill="#94a3b8" stroke="#cbd5e1" stroke-width="1.5"/>
    <rect x="80" y="36" width="80" height="62" rx="2" fill="#64748b"/>
    <!-- ESP32 Text Silkscreen -->
    <text x="120" y="62" fill="#f8fafc" font-family="monospace" font-weight="bold" font-size="9" text-anchor="middle" letter-spacing="1">ESP32-S3</text>
    <text x="120" y="75" fill="#cbd5e1" font-family="monospace" font-size="7" text-anchor="middle">WROOM-1 / 16MB</text>
    <!-- PCB Antenna trace on top -->
    <path d="M 90 32 L 90 24 L 98 24 L 98 28 L 106 28 L 106 24 L 114 24 L 114 28 L 122 28 L 122 24 L 130 24 L 130 28 L 138 28 L 138 24 L 146 24 L 146 32" fill="none" stroke="#d97706" stroke-width="2"/>
    <!-- USB-C Port -->
    <rect x="100" y="145" width="40" height="15" rx="3" fill="#cbd5e1" stroke="#475569" stroke-width="1"/>
    <rect x="108" y="149" width="24" height="7" rx="2" fill="#1e293b"/>
    <!-- Buttons -->
    <rect x="72" y="130" width="12" height="12" rx="2" fill="#334155"/>
    <circle cx="78" cy="136" r="3" fill="#dc2626"/>
    <text x="78" y="148" fill="#94a3b8" font-family="sans-serif" font-size="5" text-anchor="middle">BOOT</text>
    <rect x="156" y="130" width="12" height="12" rx="2" fill="#334155"/>
    <circle cx="162" cy="136" r="3" fill="#2563eb"/>
    <text x="162" y="148" fill="#94a3b8" font-family="sans-serif" font-size="5" text-anchor="middle">EN</text>
  </svg>`,

  rpi5: `<svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
    <rect width="240" height="180" fill="#080b11"/>
    <!-- Green PCB -->
    <rect x="35" y="25" width="170" height="130" rx="8" fill="#14532d" stroke="#15803d" stroke-width="2"/>
    <!-- Mounting holes -->
    <circle cx="45" cy="35" r="4" fill="#080b11" stroke="#ca8a04" stroke-width="1"/>
    <circle cx="195" cy="35" r="4" fill="#080b11" stroke="#ca8a04" stroke-width="1"/>
    <circle cx="45" cy="145" r="4" fill="#080b11" stroke="#ca8a04" stroke-width="1"/>
    <circle cx="195" cy="145" r="4" fill="#080b11" stroke="#ca8a04" stroke-width="1"/>
    <!-- GPIO Header -->
    <rect x="42" y="44" width="120" height="12" rx="2" fill="#0f172a"/>
    <g fill="#eab308">
      <circle cx="50" cy="48" r="1.5"/><circle cx="58" cy="48" r="1.5"/><circle cx="66" cy="48" r="1.5"/><circle cx="74" cy="48" r="1.5"/>
      <circle cx="82" cy="48" r="1.5"/><circle cx="90" cy="48" r="1.5"/><circle cx="98" cy="48" r="1.5"/><circle cx="106" cy="48" r="1.5"/>
      <circle cx="50" cy="52" r="1.5"/><circle cx="58" cy="52" r="1.5"/><circle cx="66" cy="52" r="1.5"/><circle cx="74" cy="52" r="1.5"/>
      <circle cx="82" cy="52" r="1.5"/><circle cx="90" cy="52" r="1.5"/><circle cx="98" cy="52" r="1.5"/><circle cx="106" cy="52" r="1.5"/>
    </g>
    <!-- BCM2712 SoC with Silver Heatspreader -->
    <rect x="100" y="70" width="38" height="38" rx="2" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="119" y="88" fill="#0f172a" font-family="monospace" font-weight="bold" font-size="6" text-anchor="middle">RP1 / BCM</text>
    <text x="119" y="97" fill="#475569" font-family="monospace" font-size="5" text-anchor="middle">ARM A76 2.4G</text>
    <!-- USB 3.0 Ports (Blue) -->
    <rect x="180" y="65" width="25" height="30" rx="2" fill="#0284c7" stroke="#38bdf8" stroke-width="1"/>
    <!-- Ethernet Port -->
    <rect x="180" y="105" width="25" height="32" rx="2" fill="#94a3b8" stroke="#cbd5e1" stroke-width="1"/>
    <!-- Raspberry Pi Logo Hint -->
    <circle cx="68" cy="115" r="9" fill="#e11d48"/>
    <text x="68" y="118" fill="#fff" font-family="sans-serif" font-weight="bold" font-size="9" text-anchor="middle">π</text>
    <text x="100" y="145" fill="#86efac" font-family="monospace" font-size="7" font-weight="bold">Raspberry Pi 5</text>
  </svg>`,

  bme280: `<svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
    <rect width="240" height="180" fill="#080b11"/>
    <!-- Purple/Blue Sensor PCB -->
    <rect x="75" y="40" width="90" height="100" rx="5" fill="#1e1b4b" stroke="#4338ca" stroke-width="2"/>
    <!-- Mounting hole -->
    <circle cx="120" cy="55" r="6" fill="#080b11" stroke="#ca8a04" stroke-width="1.5"/>
    <!-- Sensor Metal Cap with vent hole -->
    <rect x="105" y="75" width="30" height="25" rx="2" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
    <circle cx="112" cy="82" r="2" fill="#0f172a"/>
    <text x="120" y="92" fill="#334155" font-family="monospace" font-size="5" font-weight="bold" text-anchor="middle">BME280</text>
    <!-- Header Pin holes at bottom -->
    <g fill="#eab308">
      <rect x="85" y="125" width="6" height="8" rx="1"/>
      <rect x="97" y="125" width="6" height="8" rx="1"/>
      <rect x="109" y="125" width="6" height="8" rx="1"/>
      <rect x="121" y="125" width="6" height="8" rx="1"/>
      <rect x="133" y="125" width="6" height="8" rx="1"/>
      <rect x="145" y="125" width="6" height="8" rx="1"/>
    </g>
    <!-- Pin Labels -->
    <text x="88" y="120" fill="#a5b4fc" font-family="monospace" font-size="5" text-anchor="middle">VIN</text>
    <text x="100" y="120" fill="#a5b4fc" font-family="monospace" font-size="5" text-anchor="middle">GND</text>
    <text x="112" y="120" fill="#a5b4fc" font-family="monospace" font-size="5" text-anchor="middle">SCL</text>
    <text x="124" y="120" fill="#a5b4fc" font-family="monospace" font-size="5" text-anchor="middle">SDA</text>
    <text x="120" y="110" fill="#c7d2fe" font-family="sans-serif" font-weight="bold" font-size="6" text-anchor="middle">TEMP • HUM • BARO</text>
  </svg>`,

  ts101: `<svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
    <rect width="240" height="180" fill="#080b11"/>
    <!-- Soldering Iron Body -->
    <rect x="40" y="80" width="115" height="26" rx="5" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <!-- OLED Screen Area -->
    <rect x="75" y="85" width="40" height="16" rx="2" fill="#020617" stroke="#0ea5e9" stroke-width="1"/>
    <text x="95" y="96" fill="#38bdf8" font-family="monospace" font-size="7" font-weight="bold" text-anchor="middle">350°C</text>
    <!-- Buttons A and B -->
    <circle cx="56" cy="93" r="3.5" fill="#475569" stroke="#64748b"/>
    <circle cx="67" cy="93" r="3.5" fill="#475569" stroke="#64748b"/>
    <!-- USB-C / DC Input back -->
    <rect x="35" y="86" width="6" height="14" rx="1" fill="#64748b"/>
    <!-- Metal Collet / Ring -->
    <rect x="155" y="84" width="10" height="18" rx="1" fill="#94a3b8" stroke="#cbd5e1"/>
    <!-- Soldering Tip -->
    <path d="M 165 89 L 205 91 L 215 93 L 205 95 L 165 97 Z" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1"/>
    <path d="M 205 91 L 215 93 L 205 95 Z" fill="#d97706"/>
    <!-- Heat shimmer / label -->
    <text x="120" y="55" fill="#f59e0b" font-family="sans-serif" font-weight="bold" font-size="11" text-anchor="middle">TS101 SMART IRON</text>
    <text x="120" y="68" fill="#94a3b8" font-family="monospace" font-size="7" text-anchor="middle">65W USB-C PD / DC5525</text>
  </svg>`,

  oled: `<svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
    <rect width="240" height="180" fill="#080b11"/>
    <!-- Blue Carrier PCB -->
    <rect x="60" y="30" width="120" height="120" rx="4" fill="#0c4a6e" stroke="#0284c7" stroke-width="2"/>
    <!-- Glass Display Module -->
    <rect x="68" y="52" width="104" height="74" rx="2" fill="#030712" stroke="#38bdf8" stroke-width="1.5"/>
    <!-- Display Graphics (Simulated OLED UI) -->
    <rect x="74" y="58" width="92" height="14" fill="#facc15"/>
    <text x="120" y="68" fill="#000" font-family="sans-serif" font-weight="bold" font-size="7" text-anchor="middle">SYSTEM MONITOR</text>
    <text x="76" y="85" fill="#38bdf8" font-family="monospace" font-size="6">CPU: 48°C  RAM: 62%</text>
    <text x="76" y="97" fill="#38bdf8" font-family="monospace" font-size="6">VOLTS: 3.32V OK</text>
    <path d="M 76 115 L 90 108 L 105 118 L 125 104 L 145 112 L 160 102" fill="none" stroke="#38bdf8" stroke-width="1.5"/>
    <!-- 4 Header Pins on top -->
    <g fill="#ca8a04">
      <rect x="95" y="34" width="8" height="10" rx="1"/>
      <rect x="107" y="34" width="8" height="10" rx="1"/>
      <rect x="119" y="34" width="8" height="10" rx="1"/>
      <rect x="131" y="34" width="8" height="10" rx="1"/>
    </g>
    <text x="120" y="142" fill="#bae6fd" font-family="monospace" font-size="6" text-anchor="middle">SSD1306 128x64 I2C</text>
  </svg>`,

  logic: `<svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
    <rect width="240" height="180" fill="#080b11"/>
    <!-- Aluminum Enclosure -->
    <rect x="55" y="45" width="130" height="90" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2"/>
    <rect x="60" y="50" width="120" height="80" rx="4" fill="#0f172a"/>
    <!-- 2x5 Channel Header Pins -->
    <rect x="68" y="70" width="22" height="40" rx="2" fill="#020617" stroke="#334155"/>
    <g fill="#eab308">
      <circle cx="74" cy="76" r="2"/><circle cx="84" cy="76" r="2"/>
      <circle cx="74" cy="84" r="2"/><circle cx="84" cy="84" r="2"/>
      <circle cx="74" cy="92" r="2"/><circle cx="84" cy="92" r="2"/>
      <circle cx="74" cy="100" r="2"/><circle cx="84" cy="100" r="2"/>
    </g>
    <!-- USB Port on right -->
    <rect x="175" y="78" width="12" height="24" rx="2" fill="#94a3b8"/>
    <!-- Silkscreen text -->
    <text x="135" y="76" fill="#f8fafc" font-family="sans-serif" font-weight="bold" font-size="8">LOGIC 8-CH</text>
    <text x="135" y="88" fill="#38bdf8" font-family="monospace" font-size="7">24MHz USB</text>
    <circle cx="108" cy="112" r="3" fill="#10b981"/>
    <text x="116" y="115" fill="#94a3b8" font-family="sans-serif" font-size="6">PWR</text>
  </svg>`
};

const DEFAULT_COMPONENTS = [
  {
    id: "comp-esp32-s3",
    name: "ESP32-S3-WROOM-1 DevKit",
    sku: "ESP-S3-N16R8",
    category: "Microcontrollers",
    locationBin: "BIN-A02",
    totalQty: 5,
    specs: "Dual-Core Xtensa LX7 @ 240MHz, 16MB Flash, 8MB Octal PSRAM, USB-C native, Wi-Fi 4 + BLE 5.0.",
    tags: ["iot", "wireless", "usb-c", "espressif"],
    image: createSvgDataUri(COMPONENT_SVGS.esp32),
    createdAt: "2026-08-10T10:00:00.000Z",
    loans: [
      {
        id: "loan-1",
        recipientName: "Alex Rivera",
        recipientContact: "@alex.r (Slack)",
        quantity: 2,
        dateGiven: "2026-09-02",
        returnDueDate: "2026-09-25",
        project: "Autonomous Drone Gimbal Controller",
        notes: "Lent 2 units for I2C test rig. Promised back before end of month.",
        status: "active"
      },
      {
        id: "loan-2",
        recipientName: "Sarah Chen",
        recipientContact: "sarah.c@hardwarelab.io",
        quantity: 1,
        dateGiven: "2026-09-12",
        returnDueDate: "2026-09-20",
        project: "BLE Beacon Triangulation Test",
        notes: "Testing RSSI precision indoors.",
        status: "active"
      }
    ]
  },
  {
    id: "comp-rpi-5",
    name: "Raspberry Pi 5 (8GB RAM)",
    sku: "RPI5-8GB-V1",
    category: "SBC / Processors",
    locationBin: "CAB-C10",
    totalQty: 3,
    specs: "Broadcom BCM2712 Quad Cortex-A76 @ 2.4GHz, PCIe 2.0 interface, Dual 4Kp60 micro-HDMI, Gigabit Eth.",
    tags: ["sbc", "linux", "robotics", "arm64"],
    image: createSvgDataUri(COMPONENT_SVGS.rpi5),
    createdAt: "2026-08-12T14:30:00.000Z",
    loans: [
      {
        id: "loan-3",
        recipientName: "Dave Miller",
        recipientContact: "dave#4128 (Discord)",
        quantity: 1,
        dateGiven: "2026-08-28",
        returnDueDate: "2026-09-15", // Overdue loan example!
        project: "ROS2 Nav2 Mobile Rover",
        notes: "Needed high RAM for local SLAM LiDAR point cloud mapping.",
        status: "active"
      },
      {
        id: "loan-4",
        recipientName: "Elena Rostova",
        recipientContact: "elena@robotics-team.org",
        quantity: 1,
        dateGiven: "2026-09-10",
        returnDueDate: "2026-10-01",
        project: "Lab Edge Computer & Docker Host",
        notes: "Using official 27W USB-C PSU with active cooler.",
        status: "active"
      }
    ]
  },
  {
    id: "comp-bme280",
    name: "BME280 Environmental Sensor Module",
    sku: "SENS-BME280-I2C",
    category: "Sensors",
    locationBin: "BIN-S04",
    totalQty: 10,
    specs: "Temperature (-40 to +85°C), Relative Humidity (0-100%), and Barometric Pressure (300-1100 hPa). I2C & SPI.",
    tags: ["weather", "i2c", "low-power", "bosch"],
    image: createSvgDataUri(COMPONENT_SVGS.bme280),
    createdAt: "2026-08-15T09:00:00.000Z",
    loans: [
      {
        id: "loan-5",
        recipientName: "Maya Lin",
        recipientContact: "maya.lin@agritech.co",
        quantity: 3,
        dateGiven: "2026-09-05",
        returnDueDate: "2026-09-30",
        project: "Smart Hydroponic Greenhouse Nodes",
        notes: "3 separate climate zones.",
        status: "active"
      },
      {
        id: "loan-6",
        recipientName: "Alex Rivera",
        recipientContact: "@alex.r (Slack)",
        quantity: 1,
        dateGiven: "2026-09-14",
        returnDueDate: "2026-09-28",
        project: "Drone Altimeter Barometer Benchmarking",
        notes: "Comparing against BMP388 readings.",
        status: "active"
      }
    ]
  },
  {
    id: "comp-ts101",
    name: "TS101 Smart Soldering Iron (Grey)",
    sku: "TOOL-TS101-PD",
    category: "Tools & Equipment",
    locationBin: "TOOL-RACK-01",
    totalQty: 2,
    specs: "65W USB-C PD3.0 / 90W DC5525. OLED readout, boost temperature mode, quick-swap tip, sleep mode.",
    tags: ["soldering", "assembly", "usb-pd", "miniware"],
    image: createSvgDataUri(COMPONENT_SVGS.ts101),
    createdAt: "2026-08-01T11:00:00.000Z",
    loans: [
      {
        id: "loan-7",
        recipientName: "Jordan Hayes",
        recipientContact: "+1 (555) 392-8819",
        quantity: 1,
        dateGiven: "2026-09-15",
        returnDueDate: "2026-09-19",
        project: "Field Cable Assembly Repair",
        notes: "Borrowing TS-B2 conical tip and silicon USB-C cable.",
        status: "active"
      }
    ]
  },
  {
    id: "comp-oled-display",
    name: "0.96\" I2C OLED Display (128x64)",
    sku: "DISP-SSD1306-BLU",
    category: "Displays",
    locationBin: "BIN-D02",
    totalQty: 8,
    specs: "SSD1306 driver, 0.96 inch diagonal, 128x64 resolution, Blue pixel emissive, 3.3V-5V tolerant.",
    tags: ["display", "screen", "i2c", "low-power"],
    image: createSvgDataUri(COMPONENT_SVGS.oled),
    createdAt: "2026-08-18T16:00:00.000Z",
    loans: [] // Fully available
  },
  {
    id: "comp-logic-analyzer",
    name: "24MHz 8-Channel USB Logic Analyzer",
    sku: "TOOL-LOGIC-8CH",
    category: "Tools & Equipment",
    locationBin: "TOOL-RACK-03",
    totalQty: 2,
    specs: "8 digital input channels, 24MSps sampling rate, Saleae Logic & Sigrok pulseview compatible.",
    tags: ["debugging", "analyzer", "spi", "i2c", "uart"],
    image: createSvgDataUri(COMPONENT_SVGS.logic),
    createdAt: "2026-07-20T12:00:00.000Z",
    loans: [
      {
        id: "loan-8",
        recipientName: "Dave Miller",
        recipientContact: "dave#4128 (Discord)",
        quantity: 1,
        dateGiven: "2026-09-08",
        returnDueDate: "2026-09-22",
        project: "CAN Bus Protocol Sniffing",
        notes: "Has micro grabber probes.",
        status: "active"
      },
      {
        id: "loan-9",
        recipientName: "Jordan Hayes",
        recipientContact: "+1 (555) 392-8819",
        quantity: 1,
        dateGiven: "2026-09-13",
        returnDueDate: "2026-09-21",
        project: "SPI Flash Dumper Verification",
        notes: "Borrowed second set of jumper cables.",
        status: "active"
      }
    ]
  }
];

const DEFAULT_ACTIVITY = [
  {
    id: "act-1",
    timestamp: "2026-09-15T10:15:00.000Z",
    type: "loan",
    componentName: "TS101 Smart Soldering Iron",
    recipientName: "Jordan Hayes",
    quantity: 1,
    project: "Field Cable Assembly Repair"
  },
  {
    id: "act-2",
    timestamp: "2026-09-14T16:40:00.000Z",
    type: "loan",
    componentName: "BME280 Environmental Sensor Module",
    recipientName: "Alex Rivera",
    quantity: 1,
    project: "Drone Altimeter Barometer Benchmarking"
  },
  {
    id: "act-3",
    timestamp: "2026-09-12T11:20:00.000Z",
    type: "loan",
    componentName: "ESP32-S3-WROOM-1 DevKit",
    recipientName: "Sarah Chen",
    quantity: 1,
    project: "BLE Beacon Triangulation Test"
  },
  {
    id: "act-4",
    timestamp: "2026-09-10T14:00:00.000Z",
    type: "return",
    componentName: "DRV8825 Stepper Motor Driver",
    recipientName: "Marcus Vance",
    quantity: 2,
    project: "Pan-Tilt Camera Stand"
  }
];
