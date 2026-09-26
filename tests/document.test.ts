import { describe, expect, it } from "vitest";
import {
  blankDocument,
  sampleDocument,
  parseDocument,
  serializeDocument,
  readSaved,
  saveDocument,
  STORAGE_KEY,
  MAX_FILE_BYTES,
} from "../src/document";

describe("Portable resume documents", () => {
  it("enforces the byte limit on the final newline-terminated export", () => {
    const document = blankDocument();
    document.contact = {
      name: "x".repeat(200),
      title: "x".repeat(200),
      email: "x".repeat(200),
      phone: "x".repeat(200),
      location: "x".repeat(200),
      website: "x".repeat(200),
    };
    document.summary = "é".repeat(4000);
    document.experience = Array.from({ length: 20 }, () => ({
      employer: "x".repeat(200),
      role: "x".repeat(200),
      dates: "x".repeat(200),
      details: "x".repeat(4000),
    }));
    document.education = Array.from({ length: 20 }, () => ({
      institution: "x".repeat(200),
      qualification: "x".repeat(200),
      dates: "x".repeat(200),
    }));
    document.skills = Array(40).fill("x".repeat(200));
    const remaining =
      MAX_FILE_BYTES -
      1 -
      new TextEncoder().encode(JSON.stringify(document, null, 2)).length;
    expect(remaining).toBeGreaterThan(0);
    document.additional =
      "é".repeat(Math.floor(remaining / 2)) + (remaining % 2 ? "a" : "");
    const exported = serializeDocument(document);
    expect(new TextEncoder().encode(exported).length).toBe(MAX_FILE_BYTES);
    expect(parseDocument(exported)).toEqual(document);
    document.additional += "a";
    expect(() => serializeDocument(document)).toThrow("128 KiB");
    let written = false;
    expect(() =>
      saveDocument(
        {
          setItem() {
            written = true;
          },
        },
        document,
      ),
    ).toThrow();
    expect(written).toBe(false);
  });
  it("round trips every field without changing Unicode, text, or layout", () => {
    const document = sampleDocument();
    document.contact.name = "Zoë 李";
    document.layout = "modern";
    document.additional = "First line\nSecond line";
    expect(parseDocument(serializeDocument(document))).toEqual(document);
    expect(parseDocument(serializeDocument(blankDocument()))).toEqual(
      blankDocument(),
    );
  });

  it.each([
    ["unsupported version", { ...sampleDocument(), schemaVersion: 2 }],
    ["unknown layout", { ...sampleDocument(), layout: "javascript:alert(1)" }],
    ["unknown field", { ...sampleDocument(), script: "alert(1)" }],
    ["wrong field type", { ...sampleDocument(), summary: {} }],
    ["missing contact", { ...sampleDocument(), contact: null }],
    ["oversized text", { ...sampleDocument(), summary: "a".repeat(4001) }],
    ["control characters", { ...sampleDocument(), summary: "\u0000" }],
    [
      "excessive entries",
      {
        ...sampleDocument(),
        experience: Array(21).fill(sampleDocument().experience[0]),
      },
    ],
    [
      "excessive skills",
      { ...sampleDocument(), skills: Array(41).fill("skill") },
    ],
    [
      "unexpected nested field",
      {
        ...sampleDocument(),
        education: [
          { ...sampleDocument().education[0], url: "https://example.com" },
        ],
      },
    ],
  ])("rejects %s", (_, document) => {
    expect(() => parseDocument(JSON.stringify(document))).toThrow();
  });

  it("rejects malformed, oversized, and prototype-bearing imports", () => {
    expect(() => parseDocument("{bad")).toThrow("valid");
    expect(() => parseDocument(" ".repeat(MAX_FILE_BYTES + 1))).toThrow(
      "128 KiB",
    );
    const encoded = serializeDocument(sampleDocument()).replace(
      '"schemaVersion": 1',
      '"__proto__": {"polluted": true}, "schemaVersion": 1',
    );
    expect(() => parseDocument(encoded)).toThrow("unsupported fields");
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it("counts UTF-8 bytes and validates before saving", () => {
    expect(() => parseDocument("🌱".repeat(MAX_FILE_BYTES / 3))).toThrow(
      "128 KiB",
    );
    let written = false;
    expect(() =>
      saveDocument(
        {
          setItem() {
            written = true;
          },
        },
        { ...sampleDocument(), summary: "a".repeat(4001) },
      ),
    ).toThrow();
    expect(written).toBe(false);
  });

  it("uses one namespaced storage key and never discards unreadable data", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
    };
    expect(readSaved(storage)).toBeNull();
    saveDocument(storage, sampleDocument());
    expect([...values.keys()]).toEqual([STORAGE_KEY]);
    expect(readSaved(storage)).toEqual(sampleDocument());
    values.set(STORAGE_KEY, "broken");
    expect(() => readSaved(storage)).toThrow();
    expect(values.get(STORAGE_KEY)).toBe("broken");
  });

  it("propagates storage denial so the UI can offer a file export", () => {
    expect(() =>
      saveDocument(
        {
          setItem() {
            throw new Error("denied");
          },
        },
        sampleDocument(),
      ),
    ).toThrow("denied");
    expect(() =>
      readSaved({
        getItem() {
          throw new Error("denied");
        },
      }),
    ).toThrow("denied");
  });
});
