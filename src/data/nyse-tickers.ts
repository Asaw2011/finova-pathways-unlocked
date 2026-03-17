// Comprehensive NYSE & NASDAQ ticker list — major companies by sector
export const NYSE_TICKERS: Record<string, string> = {
  // Technology
  AAPL: "Apple Inc.", MSFT: "Microsoft Corp.", GOOGL: "Alphabet Inc.", META: "Meta Platforms",
  NVDA: "NVIDIA Corp.", AMD: "Advanced Micro Devices", INTC: "Intel Corp.", AVGO: "Broadcom Inc.",
  CRM: "Salesforce Inc.", ORCL: "Oracle Corp.", ADBE: "Adobe Inc.", IBM: "IBM Corp.",
  CSCO: "Cisco Systems", TXN: "Texas Instruments", QCOM: "Qualcomm Inc.", NOW: "ServiceNow",
  INTU: "Intuit Inc.", AMAT: "Applied Materials", MU: "Micron Technology", LRCX: "Lam Research",
  KLAC: "KLA Corp.", SNPS: "Synopsys Inc.", CDNS: "Cadence Design", FTNT: "Fortinet Inc.",
  PANW: "Palo Alto Networks", CRWD: "CrowdStrike", ZS: "Zscaler Inc.", NET: "Cloudflare Inc.",
  DDOG: "Datadog Inc.", SNOW: "Snowflake Inc.", PLTR: "Palantir Technologies", U: "Unity Software",
  RBLX: "Roblox Corp.", SHOP: "Shopify Inc.", SQ: "Block Inc.", PYPL: "PayPal Holdings",
  MRVL: "Marvell Technology", ON: "ON Semiconductor", NXPI: "NXP Semiconductors",
  HPQ: "HP Inc.", DELL: "Dell Technologies", HPE: "Hewlett Packard Enterprise",
  WDAY: "Workday Inc.", TEAM: "Atlassian Corp.", TWLO: "Twilio Inc.", OKTA: "Okta Inc.",
  ZM: "Zoom Video", DOCU: "DocuSign Inc.", SPLK: "Splunk Inc.", VEEV: "Veeva Systems",
  ANSS: "ANSYS Inc.", KEYS: "Keysight Technologies", ZBRA: "Zebra Technologies",

  // E-Commerce & Internet
  AMZN: "Amazon.com Inc.", NFLX: "Netflix Inc.", UBER: "Uber Technologies", LYFT: "Lyft Inc.",
  ABNB: "Airbnb Inc.", BKNG: "Booking Holdings", EXPE: "Expedia Group", DASH: "DoorDash Inc.",
  ETSY: "Etsy Inc.", EBAY: "eBay Inc.", W: "Wayfair Inc.", CHWY: "Chewy Inc.",
  PINS: "Pinterest Inc.", SNAP: "Snap Inc.", SPOT: "Spotify Technology",

  // Electric Vehicles & Auto
  TSLA: "Tesla Inc.", F: "Ford Motor Co.", GM: "General Motors", TM: "Toyota Motor",
  RIVN: "Rivian Automotive", LCID: "Lucid Group", NIO: "NIO Inc.", LI: "Li Auto",
  XPEV: "XPeng Inc.", STLA: "Stellantis NV",

  // Financial Services
  JPM: "JPMorgan Chase", BAC: "Bank of America", WFC: "Wells Fargo", C: "Citigroup Inc.",
  GS: "Goldman Sachs", MS: "Morgan Stanley", BLK: "BlackRock Inc.", SCHW: "Charles Schwab",
  AXP: "American Express", V: "Visa Inc.", MA: "Mastercard Inc.", COF: "Capital One",
  USB: "US Bancorp", PNC: "PNC Financial", TFC: "Truist Financial", BK: "Bank of NY Mellon",
  STT: "State Street Corp.", FITB: "Fifth Third Bancorp", KEY: "KeyCorp",
  HBAN: "Huntington Bancshares", CFG: "Citizens Financial", RF: "Regions Financial",
  ALLY: "Ally Financial", DFS: "Discover Financial", SYF: "Synchrony Financial",
  HOOD: "Robinhood Markets", COIN: "Coinbase Global", ICE: "Intercontinental Exchange",
  CME: "CME Group", NDAQ: "Nasdaq Inc.", CBOE: "Cboe Global Markets",

  // Healthcare & Pharma
  JNJ: "Johnson & Johnson", UNH: "UnitedHealth Group", PFE: "Pfizer Inc.",
  MRK: "Merck & Co.", ABBV: "AbbVie Inc.", LLY: "Eli Lilly", TMO: "Thermo Fisher",
  ABT: "Abbott Laboratories", DHR: "Danaher Corp.", BMY: "Bristol-Myers Squibb",
  AMGN: "Amgen Inc.", GILD: "Gilead Sciences", MDT: "Medtronic PLC", ISRG: "Intuitive Surgical",
  SYK: "Stryker Corp.", BSX: "Boston Scientific", EW: "Edwards Lifesciences",
  ZBH: "Zimmer Biomet", REGN: "Regeneron Pharma", VRTX: "Vertex Pharma",
  MRNA: "Moderna Inc.", BIIB: "Biogen Inc.", ILMN: "Illumina Inc.",
  DXCM: "DexCom Inc.", IDXX: "IDEXX Laboratories", IQV: "IQVIA Holdings",
  CI: "Cigna Group", ELV: "Elevance Health", HUM: "Humana Inc.", CNC: "Centene Corp.",
  HCA: "HCA Healthcare", CVS: "CVS Health Corp.", WBA: "Walgreens Boots Alliance",
  MCK: "McKesson Corp.", CAH: "Cardinal Health", ABC: "AmerisourceBergen",

  // Consumer Goods
  PG: "Procter & Gamble", KO: "Coca-Cola Co.", PEP: "PepsiCo Inc.",
  COST: "Costco Wholesale", WMT: "Walmart Inc.", TGT: "Target Corp.",
  HD: "Home Depot", LOW: "Lowe's Cos.", NKE: "Nike Inc.",
  SBUX: "Starbucks Corp.", MCD: "McDonald's Corp.", YUM: "Yum! Brands",
  DPZ: "Domino's Pizza", CMG: "Chipotle Mexican Grill", LULU: "Lululemon Athletica",
  TJX: "TJX Companies", ROST: "Ross Stores", DG: "Dollar General",
  DLTR: "Dollar Tree", BBY: "Best Buy Co.", KR: "Kroger Co.",
  CL: "Colgate-Palmolive", KMB: "Kimberly-Clark", GIS: "General Mills",
  K: "Kellanova", HSY: "Hershey Co.", MDLZ: "Mondelez International",
  STZ: "Constellation Brands", BF_B: "Brown-Forman", TAP: "Molson Coors",
  EL: "Estée Lauder", CLX: "Clorox Co.", SJM: "J.M. Smucker",
  CPB: "Campbell Soup", HRL: "Hormel Foods", MKC: "McCormick & Co.",

  // Energy
  XOM: "Exxon Mobil", CVX: "Chevron Corp.", COP: "ConocoPhillips",
  SLB: "Schlumberger Ltd.", EOG: "EOG Resources", PXD: "Pioneer Natural Resources",
  MPC: "Marathon Petroleum", VLO: "Valero Energy", PSX: "Phillips 66",
  OXY: "Occidental Petroleum", HAL: "Halliburton Co.", DVN: "Devon Energy",
  FANG: "Diamondback Energy", HES: "Hess Corp.", APA: "APA Corp.",
  BKR: "Baker Hughes", KMI: "Kinder Morgan", WMB: "Williams Cos.",
  OKE: "ONEOK Inc.", ET: "Energy Transfer",

  // Industrials
  CAT: "Caterpillar Inc.", DE: "Deere & Co.", HON: "Honeywell International",
  UPS: "United Parcel Service", FDX: "FedEx Corp.", GE: "GE Aerospace",
  RTX: "RTX Corp.", LMT: "Lockheed Martin", NOC: "Northrop Grumman",
  GD: "General Dynamics", BA: "Boeing Co.", LHX: "L3Harris Technologies",
  TDG: "TransDigm Group", HWM: "Howmet Aerospace", ITW: "Illinois Tool Works",
  EMR: "Emerson Electric", ROK: "Rockwell Automation", ETN: "Eaton Corp.",
  PH: "Parker-Hannifin", CMI: "Cummins Inc.", PCAR: "PACCAR Inc.",
  WM: "Waste Management", RSG: "Republic Services", FAST: "Fastenal Co.",
  URI: "United Rentals", NSC: "Norfolk Southern", CSX: "CSX Corp.",
  UNP: "Union Pacific", DAL: "Delta Air Lines", UAL: "United Airlines",
  LUV: "Southwest Airlines", AAL: "American Airlines",

  // Telecom & Media
  T: "AT&T Inc.", VZ: "Verizon Communications", TMUS: "T-Mobile US",
  CMCSA: "Comcast Corp.", DIS: "Walt Disney Co.", WBD: "Warner Bros Discovery",
  PARA: "Paramount Global", FOX: "Fox Corp.", NWSA: "News Corp.",
  EA: "Electronic Arts", TTWO: "Take-Two Interactive", ATVI: "Activision Blizzard",

  // Real Estate
  AMT: "American Tower", PLD: "Prologis Inc.", CCI: "Crown Castle",
  EQIX: "Equinix Inc.", SPG: "Simon Property Group", PSA: "Public Storage",
  O: "Realty Income", WELL: "Welltower Inc.", DLR: "Digital Realty",
  AVB: "AvalonBay Communities", EQR: "Equity Residential", MAA: "Mid-America Apartment",
  VICI: "VICI Properties", INVH: "Invitation Homes",

  // Utilities
  NEE: "NextEra Energy", DUK: "Duke Energy", SO: "Southern Co.",
  D: "Dominion Energy", AEP: "American Electric Power", XEL: "Xcel Energy",
  SRE: "Sempra", ED: "Consolidated Edison", EXC: "Exelon Corp.",
  WEC: "WEC Energy Group", ES: "Eversource Energy", AWK: "American Water Works",

  // Materials
  LIN: "Linde PLC", APD: "Air Products", SHW: "Sherwin-Williams",
  ECL: "Ecolab Inc.", NEM: "Newmont Corp.", FCX: "Freeport-McMoRan",
  NUE: "Nucor Corp.", STLD: "Steel Dynamics", VMC: "Vulcan Materials",
  MLM: "Martin Marietta", DOW: "Dow Inc.", DD: "DuPont de Nemours",
  PPG: "PPG Industries", ALB: "Albemarle Corp.", CF: "CF Industries",
  MOS: "Mosaic Co.", BALL: "Ball Corp.", PKG: "Packaging Corp.",

  // Insurance
  BRK_B: "Berkshire Hathaway", AIG: "American International", MET: "MetLife Inc.",
  PRU: "Prudential Financial", AFL: "Aflac Inc.", ALL: "Allstate Corp.",
  TRV: "Travelers Cos.", PGR: "Progressive Corp.", CB: "Chubb Ltd.",
  HIG: "Hartford Financial", MMC: "Marsh & McLennan", AON: "Aon PLC",
  AJG: "Arthur J. Gallagher", WRB: "W.R. Berkley",
};

// All tickers sorted alphabetically
export const ALL_TICKERS = Object.keys(NYSE_TICKERS).sort();

// Sector groupings for filtering
export const SECTORS: Record<string, string[]> = {
  "Technology": ["AAPL", "MSFT", "GOOGL", "META", "NVDA", "AMD", "INTC", "AVGO", "CRM", "ORCL", "ADBE", "IBM", "CSCO", "TXN", "QCOM", "NOW", "INTU", "AMAT", "MU", "LRCX", "KLAC", "SNPS", "CDNS", "FTNT", "PANW", "CRWD", "ZS", "NET", "DDOG", "SNOW", "PLTR", "U", "RBLX", "SHOP", "SQ", "PYPL", "MRVL", "ON", "NXPI", "HPQ", "DELL", "HPE", "WDAY", "TEAM", "TWLO", "OKTA", "ZM", "DOCU", "SPLK", "VEEV", "ANSS", "KEYS", "ZBRA"],
  "E-Commerce": ["AMZN", "NFLX", "UBER", "LYFT", "ABNB", "BKNG", "EXPE", "DASH", "ETSY", "EBAY", "W", "CHWY", "PINS", "SNAP", "SPOT"],
  "Electric Vehicles": ["TSLA", "F", "GM", "TM", "RIVN", "LCID", "NIO", "LI", "XPEV", "STLA"],
  "Financial": ["JPM", "BAC", "WFC", "C", "GS", "MS", "BLK", "SCHW", "AXP", "V", "MA", "COF", "USB", "PNC", "TFC", "BK", "STT", "FITB", "KEY", "HBAN", "CFG", "RF", "ALLY", "DFS", "SYF", "HOOD", "COIN", "ICE", "CME", "NDAQ", "CBOE"],
  "Healthcare": ["JNJ", "UNH", "PFE", "MRK", "ABBV", "LLY", "TMO", "ABT", "DHR", "BMY", "AMGN", "GILD", "MDT", "ISRG", "SYK", "BSX", "EW", "ZBH", "REGN", "VRTX", "MRNA", "BIIB", "ILMN", "DXCM", "IDXX", "IQV", "CI", "ELV", "HUM", "CNC", "HCA", "CVS", "WBA", "MCK", "CAH", "ABC"],
  "Consumer": ["PG", "KO", "PEP", "COST", "WMT", "TGT", "HD", "LOW", "NKE", "SBUX", "MCD", "YUM", "DPZ", "CMG", "LULU", "TJX", "ROST", "DG", "DLTR", "BBY", "KR", "CL", "KMB", "GIS", "K", "HSY", "MDLZ", "STZ", "EL", "CLX"],
  "Energy": ["XOM", "CVX", "COP", "SLB", "EOG", "PXD", "MPC", "VLO", "PSX", "OXY", "HAL", "DVN", "FANG", "HES", "APA", "BKR", "KMI", "WMB", "OKE", "ET"],
  "Industrial": ["CAT", "DE", "HON", "UPS", "FDX", "GE", "RTX", "LMT", "NOC", "GD", "BA", "LHX", "ITW", "EMR", "ETN", "PH", "CMI", "PCAR", "WM", "RSG", "FAST", "URI", "NSC", "CSX", "UNP", "DAL", "UAL", "LUV", "AAL"],
  "Media": ["T", "VZ", "TMUS", "CMCSA", "DIS", "WBD", "PARA", "FOX", "EA", "TTWO"],
  "Real Estate": ["AMT", "PLD", "CCI", "EQIX", "SPG", "PSA", "O", "WELL", "DLR", "AVB", "EQR", "MAA", "VICI", "INVH"],
  "Insurance": ["BRK_B", "AIG", "MET", "PRU", "AFL", "ALL", "TRV", "PGR", "CB", "HIG", "MMC", "AON", "AJG", "WRB"],
};

// Popular tickers for default view
export const POPULAR_TICKERS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", "JPM", "V", "MA",
  "UNH", "JNJ", "HD", "PG", "BAC", "XOM", "NFLX", "DIS", "KO", "PEP",
  "COST", "ABBV", "LLY", "MRK", "AMD", "CRM", "INTC", "BA", "GS", "CAT",
];
