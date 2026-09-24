import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { extractTextMessages, isValidSignature } from "../src/whatsapp.js";

describe("isValidSignature", () => {
  const body = Buffer.from('{"hello":"world"}');
  const sig = "sha256=" + createHmac("sha256", "secret").update(body).digest("hex");

  it("accepts a correct signature", () => {
    expect(isValidSignature(body, sig, "secret")).toBe(true);
  });

  it("rejects wrong or missing signatures", () => {
    expect(isValidSignature(body, sig, "other")).toBe(false);
    expect(isValidSignature(body, undefined, "secret")).toBe(false);
    expect(isValidSignature(body, "sha256=abc", "secret")).toBe(false);
  });
});

describe("extractTextMessages", () => {
  it("extracts text messages and ignores the rest", () => {
    const body = {
      object: "whatsapp_business_account",
      entry: [
        {
          changes: [
            {
              value: {
                metadata: { phone_number_id: "PNID" },
                contacts: [{ wa_id: "549111", profile: { name: "Guido" } }],
                messages: [
                  { id: "m1", from: "549111", type: "text", text: { body: "@list" } },
                  { id: "m2", from: "549111", type: "image", image: {} },
                ],
              },
            },
            { value: { metadata: { phone_number_id: "PNID" }, statuses: [{ id: "s1" }] } },
          ],
        },
      ],
    };
    expect(extractTextMessages(body)).toEqual([
      { id: "m1", from: "549111", senderName: "Guido", text: "@list", phoneNumberId: "PNID" },
    ]);
  });

  it("ignores other webhook objects", () => {
    expect(extractTextMessages({ object: "page" })).toEqual([]);
  });
});
