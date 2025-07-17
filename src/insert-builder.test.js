import { describe, it, expect } from "@jest/globals";
import { TableDefinition } from "./table-definition";
import { InsertBuilder } from "./insert-builder";
import { LiteralRef } from "./ref";

describe("InsertBuilder", () => {
  it("Debe generar una consulta que permita insertar un registro sin indicar las columnas", () => {
    const expectedQuery =
      "INSERT INTO Production.UnitMeasure VALUES (N'FT', N'Feet', '20080414')";

    const unitMeasureTable = new TableDefinition({
      name: "UnitMeasure",
      database: "AdventureWorks2022",
      schema: "Production",
      columns: ["UnitMeasureCode", "Name", "ModifiedDate"],
    });

    const ib = new InsertBuilder(unitMeasureTable, {
      omitColumnList: true,
      useDatabaseName: false,
    }).insertValues([
      {
        UnitMeasureCode: new LiteralRef("FT", true),
        Name: new LiteralRef("Feet", true),
        ModifiedDate: new LiteralRef("20080414"),
      },
    ]);

    expect(ib.build()).toBe(expectedQuery);
  });

  it("Debe generar una consulta que permita insertar varios registros sin indicar las columnas", () => {
    const expectedQuery =
      "INSERT INTO Production.UnitMeasure VALUES " +
      "(N'FT2', N'Square Feet', '20080923'), " +
      "(N'Y', N'Yards', '20080923'), " +
      "(N'Y3', N'Cubic Yards', '20080923')";

    const unitMeasureTable = new TableDefinition({
      name: "UnitMeasure",
      database: "AdventureWorks2022",
      schema: "Production",
      columns: ["UnitMeasureCode", "Name", "ModifiedDate"],
    });

    const ib = new InsertBuilder(unitMeasureTable, {
      omitColumnList: true,
      useDatabaseName: false,
    }).insertValues([
      {
        UnitMeasureCode: new LiteralRef("FT2", true),
        Name: new LiteralRef("Square Feet ", true),
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
    ]);

    expect(ib.build()).toBe(expectedQuery);
  });
});
