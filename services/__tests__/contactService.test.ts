import { describe, expect, it } from "vitest";
import { getContactPairKey } from "@/services/contactService";

describe("getContactPairKey", () => {
  it("normalizes IDs and uses the same key in either direction", () => {
    const firstId = "507F1F77BCF86CD799439011";
    const secondId = "507f1f77bcf86cd799439012";

    expect(getContactPairKey(firstId, secondId)).toBe(getContactPairKey(secondId, firstId));
    expect(getContactPairKey(firstId, secondId)).toBe(
      "507f1f77bcf86cd799439011:507f1f77bcf86cd799439012"
    );
  });
});
