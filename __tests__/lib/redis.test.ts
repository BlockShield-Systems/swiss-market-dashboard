/** @jest-environment node */

export {};

type RedisConfig = {
  url: string;
  token: string;
};

type RedisMockInstance = {
  config: RedisConfig;
};

const REDIS_TEST_ENV_SNAPSHOT = { ...process.env };

function resetRedisEnvironment() {
  process.env = { ...REDIS_TEST_ENV_SNAPSHOT };
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
}

function mockUpstashRedis() {
  const redisConstructor = jest.fn().mockImplementation(function RedisMock(
    this: RedisMockInstance,
    config: RedisConfig,
  ) {
    this.config = config;
  });

  jest.doMock("@upstash/redis", () => ({
    __esModule: true,
    Redis: redisConstructor,
    default: redisConstructor,
  }));

  return redisConstructor;
}

describe("getRedis", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    resetRedisEnvironment();
  });

  afterEach(() => {
    jest.dontMock("@upstash/redis");
    process.env = { ...REDIS_TEST_ENV_SNAPSHOT };
  });

  test("throws when Upstash Redis URL and token are missing", async () => {
    mockUpstashRedis();

    const { getRedis } = await import("@/lib/redis");

    expect(() => getRedis()).toThrow("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set");
  });

  test("throws when Upstash Redis URL is missing", async () => {
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

    mockUpstashRedis();

    const { getRedis } = await import("@/lib/redis");

    expect(() => getRedis()).toThrow("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set");
  });

  test("throws when Upstash Redis token is missing", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example-upstash-redis.test";

    mockUpstashRedis();

    const { getRedis } = await import("@/lib/redis");

    expect(() => getRedis()).toThrow("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set");
  });

  test("creates a Redis client when required environment variables are present", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example-upstash-redis.test";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

    const redisConstructor = mockUpstashRedis();

    const { getRedis } = await import("@/lib/redis");

    const client = getRedis();

    expect(redisConstructor).toHaveBeenCalledTimes(1);
    expect(redisConstructor).toHaveBeenCalledWith({
      url: "https://example-upstash-redis.test",
      token: "test-token",
    });
    expect(client).toBe(redisConstructor.mock.instances[0]);
  });

  test("memoizes the Redis client instance", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example-upstash-redis.test";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

    const redisConstructor = mockUpstashRedis();

    const { getRedis } = await import("@/lib/redis");

    const firstClient = getRedis();
    const secondClient = getRedis();

    expect(firstClient).toBe(secondClient);
    expect(redisConstructor).toHaveBeenCalledTimes(1);
  });
});