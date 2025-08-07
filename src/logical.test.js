import { describe, expect, it } from "@jest/globals";
import { Logical } from "./logical";
import { ColumnRef } from "./ref";

describe("Logical", () => {
  describe("LIKE", () => {
    it("A. Use LIKE with the % wildcard character", () => {
      const expectedQuery = "ph.PhoneNumber LIKE '415%'";
      const matchExpression = new ColumnRef("ph", "PhoneNumber");
      const pattern = "415%";

      expect(
        Logical.like({
          matchExpression,
          pattern,
        }).build()
      ).toEqual(expectedQuery);

      expect(matchExpression.isLike(pattern).build()).toEqual(expectedQuery);
    });

    it("B. Use NOT LIKE with the % wildcard character", () => {
      const expectedQuery = "ph.PhoneNumber NOT LIKE '415%'";
      const matchExpression = new ColumnRef("ph", "PhoneNumber");
      const pattern = "415%";

      expect(
        Logical.like({
          matchExpression,
          pattern,
          not: true,
        }).build()
      ).toEqual(expectedQuery);

      expect(matchExpression.isNotLike(pattern).build()).toEqual(expectedQuery);
    });

    it("C. Use the ESCAPE clause", () => {
      const expectedQuery = "c1 LIKE '%10-15!% off%' ESCAPE '!'";
      const matchExpression = new ColumnRef(null, "c1");
      const pattern = "%10-15!% off%";
      const escapeCharacter = "!";

      expect(
        Logical.like({
          matchExpression,
          pattern,
          escapeCharacter,
        }).build()
      ).toEqual(expectedQuery);

      expect(matchExpression.isLike(pattern, escapeCharacter).build()).toEqual(
        expectedQuery
      );
    });

    it("D. Use the [ ] wildcard characters", () => {
      const expectedQuery = "FirstName LIKE '[CS]heryl'";
      const matchExpression = new ColumnRef(null, "FirstName");
      const pattern = "[CS]heryl";

      expect(
        Logical.like({
          matchExpression,
          pattern,
        }).build()
      ).toEqual(expectedQuery);

      expect(matchExpression.isLike(pattern).build()).toEqual(expectedQuery);
    });

    it("E. Use LIKE with the ^ wildcard character", () => {
      const expectedQuery = "au_lname LIKE 'de[^l]%'";
      const matchExpression = new ColumnRef(null, "au_lname");
      const pattern = "de[^l]%";

      expect(
        Logical.like({
          matchExpression,
          pattern,
        }).build()
      ).toEqual(expectedQuery);

      expect(matchExpression.isLike(pattern).build()).toEqual(expectedQuery);
    });

    it("G. Use LIKE with the _ wildcard character", () => {
      const expectedQuery = "phone LIKE '6_2%'";
      const matchExpression = new ColumnRef(null, "phone");
      const pattern = "6_2%";

      expect(
        Logical.like({
          matchExpression,
          pattern,
        }).build()
      ).toEqual(expectedQuery);

      expect(matchExpression.isLike(pattern).build()).toEqual(expectedQuery);
    });
  });
});
