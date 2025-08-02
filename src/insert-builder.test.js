import { describe, it, expect } from "@jest/globals";
import { TableDefinition } from "./table-definition";
import { InsertBuilder } from "./insert-builder";
import { N } from "./ref";
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
          UnitMeasureCode: N`FT`,
          Name: N`Feet`,
          ModifiedDate: "20080414",
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
          UnitMeasureCode: N`FT2`,
          Name: N`Square Feet`,
          ModifiedDate: "20080923",
        },
        {
          UnitMeasureCode: N`Y`,
          Name: N`Yards`,
          ModifiedDate: "20080923",
        },
        {
          UnitMeasureCode: N`Y3`,
          Name: N`Cubic Yards`,
          ModifiedDate: "20080923",
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
          Name: N`Square Yards`,
          UnitMeasureCode: N`Y2`,
          ModifiedDate: Fn.GETDATE(),
        },
      ],
    });

    expect(ib.build()).toBe(expectedQuery);
  });
});
