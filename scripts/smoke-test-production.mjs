const DEFAULT_BASE_URL = "https://dashboard.ai-techart.com";
const BASE_URL = (process.env.SMOKE_TEST_BASE_URL ?? DEFAULT_BASE_URL).replace(
  /\/$/,
  "",
);

const REQUEST_TIMEOUT_MS = Number(process.env.SMOKE_TEST_TIMEOUT_MS ?? 15000);

const requiredSecurityHeaders = [
  "content-security-policy",
  "referrer-policy",
  "x-content-type-options",
  "x-frame-options",
  "x-permitted-cross-domain-policies",
  "cross-origin-opener-policy",
  "cross-origin-resource-policy",
  "permissions-policy",
  "strict-transport-security",
];

const requiredPublicApiHeaders = [
  "x-api-route",
  "x-data-source",
  "x-cache",
  "x-cache-ttl",
  "x-cache-scope",
  "cache-control",
];

const forbiddenResponseHeaders = [
  "x-powered-by",
];

let passedChecks = 0;
let failedChecks = 0;

function logPass(message) {
  passedChecks += 1;
  console.log(`PASS ${message}`);
}

function logFail(message) {
  failedChecks += 1;
  console.error(`FAIL ${message}`);
}

function assert(condition, message) {
  if (condition) {
    logPass(message);
    return;
  }

  logFail(message);
}

function buildUrl(path) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${BASE_URL}${path}`;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "User-Agent": "swiss-dashboard-production-smoke-test/1.0",
        ...(options.headers ?? {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function hasContentType(response, expectedContentTypes) {
  const contentType = response.headers.get("content-type") ?? "";

  return expectedContentTypes.some((expected) => contentType.includes(expected));
}

function assertHeaders(response, headers, label) {
  for (const header of headers) {
    assert(
      response.headers.has(header),
      `${label} exposes required header: ${header}`,
    );
  }
}

function assertForbiddenHeaders(response, headers, label) {
  for (const header of headers) {
    assert(
      !response.headers.has(header),
      `${label} does not expose forbidden header: ${header}`,
    );
  }
}

async function readJson(response, label) {
  try {
    return await response.json();
  } catch (error) {
    logFail(`${label} returns parseable JSON: ${String(error)}`);
    return null;
  }
}

async function checkRoute({
  label,
  path,
  expectedStatus = 200,
  expectedContentTypes,
  requiredHeaders = [],
  forbiddenHeaders = forbiddenResponseHeaders,
  validateJson,
}) {
  const url = buildUrl(path);

  console.log("");
  console.log(`Checking ${label}`);
  console.log(url);

  let response;

  try {
    response = await fetchWithTimeout(url);
  } catch (error) {
    logFail(`${label} request completed: ${String(error)}`);
    return;
  }

  assert(
    response.status === expectedStatus,
    `${label} status is ${expectedStatus} (received ${response.status})`,
  );

  if (expectedContentTypes?.length) {
    assert(
      hasContentType(response, expectedContentTypes),
      `${label} content-type matches ${expectedContentTypes.join(" or ")}`,
    );
  }

  assertHeaders(response, requiredHeaders, label);
  assertForbiddenHeaders(response, forbiddenHeaders, label);

  if (validateJson) {
    const json = await readJson(response, label);

    if (json !== null) {
      validateJson(json, response);
    }
  }
}

function validateCryptoGlobal(json) {
  assert(
    typeof json.active_cryptocurrencies === "number",
    "crypto global JSON has active_cryptocurrencies number",
  );
  assert(
    typeof json.total_market_cap_chf === "number",
    "crypto global JSON has total_market_cap_chf number",
  );
  assert(
    typeof json.total_volume_chf === "number",
    "crypto global JSON has total_volume_chf number",
  );
  assert(
    json.market_cap_percentage &&
      typeof json.market_cap_percentage === "object",
    "crypto global JSON has market_cap_percentage object",
  );
}

function validateWeatherForecast(json) {
  assert(
    json.timezone === "Europe/Zurich",
    "weather JSON has Europe/Zurich timezone",
  );
  assert(
    json.daily && typeof json.daily === "object",
    "weather JSON has daily forecast object",
  );
  assert(
    Array.isArray(json.daily?.time),
    "weather JSON has daily.time array",
  );
  assert(
    Array.isArray(json.daily?.temperature_2m_max),
    "weather JSON has daily.temperature_2m_max array",
  );
}

function validateMarketChart(json) {
  assert(Array.isArray(json), "market chart JSON is an array");
  assert(json.length > 0, "market chart JSON is not empty");

  const first = json[0];

  assert(
    first && typeof first.timestamp === "number",
    "market chart item has numeric timestamp",
  );
  assert(
    first && typeof first.price === "number",
    "market chart item has numeric price",
  );
  assert(
    first && typeof first.marketCap === "number",
    "market chart item has numeric marketCap",
  );
  assert(
    first && typeof first.volume === "number",
    "market chart item has numeric volume",
  );
}

function validateOhlcChart(json) {
  assert(Array.isArray(json), "OHLC JSON is an array");
  assert(json.length > 0, "OHLC JSON is not empty");

  const first = json[0];

  assert(
    first && typeof first.timestamp === "number",
    "OHLC item has numeric timestamp",
  );
  assert(first && typeof first.open === "number", "OHLC item has numeric open");
  assert(first && typeof first.high === "number", "OHLC item has numeric high");
  assert(first && typeof first.low === "number", "OHLC item has numeric low");
  assert(
    first && typeof first.close === "number",
    "OHLC item has numeric close",
  );
}

async function main() {
  console.log(`Production smoke test target: ${BASE_URL}`);
  console.log(`Request timeout: ${REQUEST_TIMEOUT_MS}ms`);

  const htmlRoutes = [
    { label: "Home page", path: "/" },
    { label: "Crypto page", path: "/crypto" },
    { label: "Weather page", path: "/weather" },
    { label: "About page", path: "/about" },
    { label: "Settings page", path: "/settings" },
    { label: "Insights page", path: "/insights" },
  ];

  for (const route of htmlRoutes) {
    await checkRoute({
      ...route,
      expectedContentTypes: ["text/html"],
      requiredHeaders: requiredSecurityHeaders,
    });
  }

  await checkRoute({
    label: "robots.txt",
    path: "/robots.txt",
    expectedContentTypes: ["text/plain"],
    requiredHeaders: requiredSecurityHeaders,
  });

  await checkRoute({
    label: "sitemap.xml",
    path: "/sitemap.xml",
    expectedContentTypes: ["application/xml", "text/xml"],
    requiredHeaders: requiredSecurityHeaders,
  });

  await checkRoute({
    label: "OpenGraph image",
    path: "/opengraph-image?smoke=1",
    expectedContentTypes: ["image/png"],
    requiredHeaders: requiredSecurityHeaders,
  });

  await checkRoute({
    label: "Crypto global API",
    path: "/api/crypto/global",
    expectedContentTypes: ["application/json"],
    requiredHeaders: [...requiredSecurityHeaders, ...requiredPublicApiHeaders],
    validateJson: validateCryptoGlobal,
  });

  await checkRoute({
    label: "Weather API",
    path: "/api/weather?key=zurich",
    expectedContentTypes: ["application/json"],
    requiredHeaders: [...requiredSecurityHeaders, ...requiredPublicApiHeaders],
    validateJson: validateWeatherForecast,
  });

  await checkRoute({
    label: "Bitcoin market chart API",
    path: "/api/crypto/bitcoin/market-chart?days=7",
    expectedContentTypes: ["application/json"],
    requiredHeaders: [...requiredSecurityHeaders, ...requiredPublicApiHeaders],
    validateJson: validateMarketChart,
  });

  await checkRoute({
    label: "Bitcoin OHLC API",
    path: "/api/crypto/bitcoin/ohlc?days=7",
    expectedContentTypes: ["application/json"],
    requiredHeaders: [...requiredSecurityHeaders, ...requiredPublicApiHeaders],
    validateJson: validateOhlcChart,
  });

  console.log("");
  console.log("Smoke test summary");
  console.log(`Passed checks: ${passedChecks}`);
  console.log(`Failed checks: ${failedChecks}`);

  if (failedChecks > 0) {
    process.exitCode = 1;
    return;
  }

  console.log("Production smoke test completed successfully.");
}

main().catch((error) => {
  console.error("Production smoke test failed unexpectedly:");
  console.error(error);
  process.exitCode = 1;
});
