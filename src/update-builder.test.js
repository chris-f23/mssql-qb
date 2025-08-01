import { describe, it, expect } from "@jest/globals";
import { TableDefinition } from "./table-definition";
import { Fn } from "./fn";
import { UpdateBuilder } from "./update-builder";

describe("UpdateBuilder", () => {
  it("A. Using a simple UPDATE statement", () => {
    const personAddressTable = new TableDefinition({
      name: "Address",
      database: "AdventureWorks2022",
      schema: "Person",
      columns: ["ModifiedDate", "PersonId"],
    });

    const expectedQuery = "UPDATE Person.Address SET ModifiedDate = GETDATE()";

    const ub = new UpdateBuilder(personAddressTable, {
      useDatabaseName: false,
    }).update((target) => {
      target.set("ModifiedDate", Fn.GETDATE());
    });

    expect(ub.build()).toBe(expectedQuery);
  });
});
