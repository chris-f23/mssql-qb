import { describe, it, expect } from "@jest/globals";
import { isTrue } from "./is-true";

describe("isTrue", () => {
  it("Should return true", () => {
    expect(isTrue(true)).toBe(true);
  });

  it("Should return false", () => {
    expect(isTrue(false)).toBe(false);
  });
});
