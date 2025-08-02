import { describe, it, expect } from "@jest/globals";
import { TableDefinition } from "./table-definition";
import { Fn } from "./fn";
import { UpdateBuilder } from "./update-builder";
import { LiteralRef, N } from "./ref";
import { Comparison, Condition } from "./search-condition";

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

  it("B. Updating multiple columns", () => {
    const expectedQuery =
      "UPDATE Sales.SalesPerson SET Bonus = 6000, CommissionPct = 0.1, SalesQuota = NULL";

    const salesPersonTable = new TableDefinition({
      name: "SalesPerson",
      database: "AdventureWorks2022",
      schema: "Sales",
      columns: ["Bonus", "CommissionPct", "SalesQuota"],
    });

    const ub = new UpdateBuilder(salesPersonTable, {
      useDatabaseName: false,
    }).update((target) => {
      target.set("Bonus", 6000);
      target.set("CommissionPct", 0.1);
      target.set("SalesQuota", null);
    });

    expect(ub.build()).toBe(expectedQuery);
  });

  it("C. Using the WHERE clause", () => {
    const expectedQuery =
      "UPDATE Production.Product SET Color = N'Metallic Red' " +
      "WHERE Name LIKE N'Road-250%' AND Color = N'Red'";

    const productTable = new TableDefinition({
      name: "Product",
      database: "AdventureWorks2022",
      schema: "Production",
      columns: ["Color", "Name"],
    });

    const ub = new UpdateBuilder(productTable, {
      useDatabaseName: false,
    })
      .update((record) => {
        record.set("Color", N`Metallic Red`);
      })
      .where((record) => {
        const isNamedLikeRoad250 = record.compare("Name", "LIKE", N`Road-250%`);
        const isRed = record.compare("Color", "=", N`Red`);

        return isNamedLikeRoad250.$and(isRed);
      });

    expect(ub.build()).toBe(expectedQuery);
  });

  it("D. Using the TOP clause", () => {
    const expectedQuery =
      "UPDATE TOP (10) HumanResources.Employee SET VacationHours = VacationHours * 1.25";

    const employeeTable = new TableDefinition({
      name: "Employee",
      database: "AdventureWorks2022",
      schema: "HumanResources",
      columns: ["VacationHours"],
    });

    const ub = new UpdateBuilder(employeeTable, {
      useDatabaseName: false,
    })
      .update((record) => {
        record.set(
          "VacationHours",
          record.get("VacationHours").$multiplyBy(1.25)
        );
      })
      .top(10);

    expect(ub.build()).toBe(expectedQuery);
  });
});
