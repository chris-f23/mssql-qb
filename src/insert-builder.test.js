import { describe, it, expect } from "@jest/globals";
import { TableDefinition } from "./table-definition";
import { InsertBuilder } from "./insert-builder";
import { LiteralRef } from "./ref";
import { Fn } from "./fn";

const unitMeasureTable = new TableDefinition({
  name: "UnitMeasure",
  database: "AdventureWorks2022",
  schema: "Production",
  columns: ["UnitMeasureCode", "Name", "ModifiedDate"],
});

describe("InsertBuilder", () => {
  it("A. Inserting a single row of data", () => {
    const expectedQuery =
      "INSERT INTO Production.UnitMeasure " +
      "VALUES (N'FT', N'Feet', '20080414')";

    const ib = new InsertBuilder(unitMeasureTable, {
      useDatabaseName: false,
    }).insert({
      rows: [
        {
          UnitMeasureCode: new LiteralRef("FT", true),
          Name: new LiteralRef("Feet", true),
          ModifiedDate: new LiteralRef("20080414"),
        },
      ],
    });

    expect(ib.build()).toBe(expectedQuery);
  });

  it("B. Inserting multiple rows of data", () => {
    const expectedQuery =
      "INSERT INTO Production.UnitMeasure VALUES " +
      "(N'FT2', N'Square Feet', '20080923'), " +
      "(N'Y', N'Yards', '20080923'), " +
      "(N'Y3', N'Cubic Yards', '20080923')";

    const ib = new InsertBuilder(unitMeasureTable, {
      useDatabaseName: false,
    }).insert({
      rows: [
        {
          UnitMeasureCode: new LiteralRef("FT2", true),
          Name: new LiteralRef("Square Feet", true),
          ModifiedDate: new LiteralRef("20080923"),
        },
        {
          UnitMeasureCode: new LiteralRef("Y", true),
          Name: new LiteralRef("Yards", true),
          ModifiedDate: new LiteralRef("20080923"),
        },
        {
          UnitMeasureCode: new LiteralRef("Y3", true),
          Name: new LiteralRef("Cubic Yards", true),
          ModifiedDate: new LiteralRef("20080923"),
        },
      ],
    });

    expect(ib.build()).toBe(expectedQuery);
  });

  it("C. Inserting data that is not in the same order as the table columns", () => {
    const expectedQuery =
      "INSERT INTO Production.UnitMeasure (Name, UnitMeasureCode, ModifiedDate) " +
      "VALUES (N'Square Yards', N'Y2', GETDATE())";

    const ib = new InsertBuilder(unitMeasureTable, {
      useDatabaseName: false,
    }).insert({
      columns: ["Name", "UnitMeasureCode", "ModifiedDate"],
      rows: [
        {
          Name: new LiteralRef("Square Yards", true),
          UnitMeasureCode: new LiteralRef("Y2", true),
          ModifiedDate: Fn.GETDATE(),
        },
      ],
    });

    expect(ib.build()).toBe(expectedQuery);
  });
});
