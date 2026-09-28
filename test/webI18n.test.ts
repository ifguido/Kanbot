import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

type Dict = Record<string, string>;

/** Carga web/i18n.js en un "navegador" mínimo y devuelve lo que expone en window.i18n. */
function loadI18n({ languages = ["en-US"], timeZone = "UTC", saved = null as string | null, search = "" } = {}) {
  const window: Record<string, any> = {};
  const classes = new Set<string>();
  const context = {
    window,
    document: {
      documentElement: { lang: "", classList: { add: (c: string) => classes.add(c), remove: (c: string) => classes.delete(c) } },
      addEventListener: () => {},
    },
    navigator: { languages, language: languages[0] },
    localStorage: { getItem: () => saved, setItem: () => {} },
    location: { search, href: `https://kanbot.live/${search}`, pathname: "/" },
    Intl: { DateTimeFormat: () => ({ resolvedOptions: () => ({ timeZone }) }) },
    URLSearchParams,
    URL,
  };
  runInNewContext(readFileSync(new URL("../web/i18n.js", import.meta.url), "utf8"), context);
  return { i18n: window.i18n as { lang: string; t: (k: string) => string; dictionaries: Record<string, Dict> }, classes };
}

describe("web i18n", () => {
  it("has the same keys in every language", () => {
    const { dictionaries } = loadI18n().i18n;
    const reference = Object.keys(dictionaries.es).sort();
    for (const [lang, dict] of Object.entries(dictionaries)) {
      expect(Object.keys(dict).sort(), `claves de ${lang}`).toEqual(reference);
    }
  });

  it("uses the same {placeholders} in every translation", () => {
    const { dictionaries } = loadI18n().i18n;
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(",");
    for (const [key, value] of Object.entries(dictionaries.es)) {
      for (const [lang, dict] of Object.entries(dictionaries)) {
        expect(placeholders(dict[key]), `${lang}:${key}`).toBe(placeholders(value));
      }
    }
  });

  it("picks the language: saved choice, then ?lang, then a non-English browser, then the time zone", () => {
    expect(loadI18n({ saved: "it", languages: ["de-DE"] }).i18n.lang).toBe("it");
    expect(loadI18n({ search: "?lang=sw", languages: ["de-DE"] }).i18n.lang).toBe("sw");
    expect(loadI18n({ languages: ["de-AT", "en"] }).i18n.lang).toBe("de");
    expect(loadI18n({ languages: ["en-US"], timeZone: "Europe/Berlin" }).i18n.lang).toBe("de");
    expect(loadI18n({ languages: ["en-US"], timeZone: "Europe/Rome" }).i18n.lang).toBe("it");
    expect(loadI18n({ languages: ["en-GB"], timeZone: "Africa/Nairobi" }).i18n.lang).toBe("sw");
    expect(loadI18n({ languages: ["en-US"], timeZone: "America/Argentina/Buenos_Aires" }).i18n.lang).toBe("es");
    expect(loadI18n({ languages: ["en-US"], timeZone: "America/New_York" }).i18n.lang).toBe("en");
    expect(loadI18n({ languages: ["fr-FR"], timeZone: "Europe/Paris" }).i18n.lang).toBe("en");
  });

  it("hides the page until it's translated, except in Spanish (the HTML's own language)", () => {
    expect(loadI18n({ saved: "de" }).classes.has("i18n-pending")).toBe(true);
    expect(loadI18n({ saved: "es" }).classes.has("i18n-pending")).toBe(false);
  });
});
