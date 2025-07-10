import { describe, it, expect } from "@jest/globals";
import { TableDefinition, Column } from "./table-definition.js";

describe("Table Definition", () => {
  it("Debe definir una tabla con su nombre, esquema, base de datos y columnas", () => {
    const personTable = new TableDefinition({
      name: "Person",
      schema: "dbo",
      database: "MAIN_DB",
      columns: {
        id: new Column("Id"),
        name: new Column("Name"),
        age: new Column("Age"),
      },
    });

    expect(personTable).toMatchObject({
      name: "Person",
      schema: "dbo",
      database: "MAIN_DB",
      columns: {
        id: { name: "Id" },
        name: { name: "Name" },
        age: { name: "Age" },
      },
    });
  });
});
