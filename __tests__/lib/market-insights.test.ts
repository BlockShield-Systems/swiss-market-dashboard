describe("market insights query helpers", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("loads latest market insights ordered by creation date", async () => {
    const rows = [
      {
        id: "insight-1",
        coinId: "bitcoin",
        title: "Bitcoin insight",
      },
    ];

    const limit = jest.fn().mockResolvedValue(rows);
    const orderBy = jest.fn(() => ({
      limit,
    }));
    const from = jest.fn(() => ({
      orderBy,
    }));
    const select = jest.fn(() => ({
      from,
    }));

    const desc = jest.fn((column: unknown) => ({
      desc: column,
    }));

    const marketInsights = {
      createdAt: "created_at",
      coinId: "coin_id",
    };

    jest.doMock("@/lib/db/client", () => ({
      db: {
        select,
      },
    }));

    jest.doMock("@/lib/db/schema", () => ({
      marketInsights,
    }));

    jest.doMock("drizzle-orm", () => ({
      desc,
      eq: jest.fn(),
    }));

    const { getLatestMarketInsights } = await import(
      "@/lib/db/queries/market-insights"
    );

    await expect(getLatestMarketInsights(5)).resolves.toBe(rows);

    expect(select).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith(marketInsights);
    expect(desc).toHaveBeenCalledWith(marketInsights.createdAt);
    expect(orderBy).toHaveBeenCalledWith({
      desc: marketInsights.createdAt,
    });
    expect(limit).toHaveBeenCalledWith(5);
  });

  it("loads market insights for a specific coin", async () => {
    const rows = [
      {
        id: "insight-2",
        coinId: "ethereum",
        title: "Ethereum insight",
      },
    ];

    const limit = jest.fn().mockResolvedValue(rows);
    const orderBy = jest.fn(() => ({
      limit,
    }));
    const where = jest.fn(() => ({
      orderBy,
    }));
    const from = jest.fn(() => ({
      where,
    }));
    const select = jest.fn(() => ({
      from,
    }));

    const desc = jest.fn((column: unknown) => ({
      desc: column,
    }));
    const eq = jest.fn((left: unknown, right: unknown) => ({
      eq: [left, right],
    }));

    const marketInsights = {
      createdAt: "created_at",
      coinId: "coin_id",
    };

    jest.doMock("@/lib/db/client", () => ({
      db: {
        select,
      },
    }));

    jest.doMock("@/lib/db/schema", () => ({
      marketInsights,
    }));

    jest.doMock("drizzle-orm", () => ({
      desc,
      eq,
    }));

    const { getMarketInsightsByCoin } = await import(
      "@/lib/db/queries/market-insights"
    );

    await expect(getMarketInsightsByCoin("ethereum", 3)).resolves.toBe(rows);

    expect(select).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith(marketInsights);
    expect(eq).toHaveBeenCalledWith(marketInsights.coinId, "ethereum");
    expect(where).toHaveBeenCalledWith({
      eq: [marketInsights.coinId, "ethereum"],
    });
    expect(desc).toHaveBeenCalledWith(marketInsights.createdAt);
    expect(orderBy).toHaveBeenCalledWith({
      desc: marketInsights.createdAt,
    });
    expect(limit).toHaveBeenCalledWith(3);
  });

  it("creates a market insight and returns the inserted row", async () => {
    const values = {
      coinId: "bitcoin",
      locale: "de",
      title: "Bitcoin AI-Marktüberblick",
      summary: "Neutraler Test-Summary.",
      source: "ai",
      model: "test-model",
      confidenceScore: 85,
      metadata: {
        priceChf: 100,
      },
    };

    const created = {
      id: "created-id",
      ...values,
    };

    const returning = jest.fn().mockResolvedValue([created]);
    const insertValues = jest.fn(() => ({
      returning,
    }));
    const insert = jest.fn(() => ({
      values: insertValues,
    }));

    const marketInsights = {
      createdAt: "created_at",
      coinId: "coin_id",
    };

    jest.doMock("@/lib/db/client", () => ({
      db: {
        insert,
      },
    }));

    jest.doMock("@/lib/db/schema", () => ({
      marketInsights,
    }));

    jest.doMock("drizzle-orm", () => ({
      desc: jest.fn(),
      eq: jest.fn(),
    }));

    const { createMarketInsight } = await import(
      "@/lib/db/queries/market-insights"
    );

    await expect(createMarketInsight(values)).resolves.toBe(created);

    expect(insert).toHaveBeenCalledWith(marketInsights);
    expect(insertValues).toHaveBeenCalledWith(values);
    expect(returning).toHaveBeenCalledTimes(1);
  });
});
