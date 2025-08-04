import { describe, expect, it } from "@jest/globals";
import { QueryBuilder } from "./query-builder";
import { TableDefinition } from "./table-definition";

const productTable = new TableDefinition({
  name: "Product",
  database: "AdventureWorks2022",
  schema: "Production",
  columns: ["Name", "ProductNumber", "ListPrice", "Color"],
});

describe("QueryBuilder", () => {
  it("A. Use SELECT to retrieve rows and columns", () => {
    const expectedQuery = "SELECT * FROM Production.Product ORDER BY Name ASC";

    const generatedQuery = new QueryBuilder(
      { p: productTable },
      {
        useDatabaseName: false,
        useSchemaName: true,
        useTableAlias: false,
      }
    )
      .select((helper) => {
        helper.selectStar("p");
        helper.from("p");
        helper.orderBy("p", "Name", "ASC");
      })
      .build();

    expect(generatedQuery).toEqual(expectedQuery);
  });

  it("A1. Use SELECT to retrieve rows and columns, alternate way", () => {
    const expectedQuery =
      "SELECT p.* FROM Production.Product AS p ORDER BY p.Name ASC";

    const generatedQuery = new QueryBuilder(
      { p: productTable },
      {
        useDatabaseName: false,
        useSchemaName: true,
        useTableAlias: true,
      }
    )
      .select((helper) => {
        helper.selectStar("p");
        helper.from("p");
        helper.orderBy("p", "Name", "ASC");
      })
      .build();

    expect(generatedQuery).toEqual(expectedQuery);
  });

  it("A2. Select all rows, and only a subset of the columns", () => {
    const expectedQuery =
      "SELECT Name, ProductNumber, ListPrice AS Price FROM Production.Product ORDER BY Name ASC";

    const generatedQuery = new QueryBuilder(
      { p: productTable },
      {
        useDatabaseName: false,
        useSchemaName: true,
        useTableAlias: false,
      }
    )
      .select((helper) => {
        helper.selectColumn("p", "Name");
        helper.selectColumn("p", "ProductNumber");
        helper.selectColumn("p", "ListPrice", "Price");
        helper.from("p");
        helper.orderBy("p", "Name", "ASC");
      })
      .build();

    expect(generatedQuery).toEqual(expectedQuery);
  });
});
