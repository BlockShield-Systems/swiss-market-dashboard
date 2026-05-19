import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PreferencesProvider,
  usePreferences,
} from "@/components/preferences-provider";

const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

function PreferencesConsumer() {
  const { locale, setLocale, isPending } = usePreferences();

  return (
    <div>
      <p data-testid="locale">{locale}</p>
      <p data-testid="pending">{String(isPending)}</p>
      <button type="button" onClick={() => setLocale("en")}>
        Set English
      </button>
      <button type="button" onClick={() => setLocale("de")}>
        Set German
      </button>
    </div>
  );
}

describe("PreferencesProvider", () => {
  beforeEach(() => {
    refreshMock.mockClear();
    document.cookie = "locale=; path=/; max-age=0";
    document.documentElement.lang = "";
  });

  it("provides the initial locale", () => {
    render(
      <PreferencesProvider initialLocale="de">
        <PreferencesConsumer />
      </PreferencesProvider>,
    );

    expect(screen.getByTestId("locale")).toHaveTextContent("de");
    expect(document.documentElement.lang).toBe("de");
  });

  it("updates locale, document language and cookie", async () => {
    const user = userEvent.setup();

    render(
      <PreferencesProvider initialLocale="de">
        <PreferencesConsumer />
      </PreferencesProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Set English" }));

    expect(screen.getByTestId("locale")).toHaveTextContent("en");
    expect(document.documentElement.lang).toBe("en");
    expect(document.cookie).toContain("locale=en");
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it("does not refresh when selecting the already active locale", async () => {
    const user = userEvent.setup();

    render(
      <PreferencesProvider initialLocale="de">
        <PreferencesConsumer />
      </PreferencesProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Set German" }));

    expect(screen.getByTestId("locale")).toHaveTextContent("de");
    expect(refreshMock).not.toHaveBeenCalled();
  });
});
