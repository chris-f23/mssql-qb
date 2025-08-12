import { describe, expect, it } from "@jest/globals";
import { QueryFactory } from "../query-factory";
import { TableDefinition } from "../table-definition";
import { Logical } from "../logical";
import { Fn } from "../fn";
import { SelectBuilder } from "./select-builder";

const customerTable = new TableDefinition({
  name: "Customer",
  database: "AdventureWorks2022",
  schema: "Sales",
  columns: ["customerId", "customerName", "City", "Country"],
});

const productTable = new TableDefinition({
  name: "Product",
  database: "AdventureWorks2022",
  schema: "Production",
  columns: ["productId", "name", "color", "price"],
});

describe("SelectBuilder", () => {
  it("A. Should select all columns from Customer table", () => {
    const expectedQuery = "SELECT * FROM Customer";

    const selectBuilder = new SelectBuilder(
      { c: customerTable },
      {
        useDatabaseName: false,
        useSchemaName: false,
        useTableAlias: false,
      }
    );

    selectBuilder.selectAllColumns("c");
    selectBuilder.from("c");
    const generatedQuery = selectBuilder.build();

    expect(generatedQuery).toEqual(expectedQuery);
  });

  it("B. Should select City column from Customer table", () => {
    const expectedQuery = "SELECT City FROM Customer";

    const selectBuilder = new SelectBuilder(
      { c: customerTable },
      {
        useDatabaseName: false,
        useSchemaName: false,
        useTableAlias: false,
      }
    );

    selectBuilder.selectColumn("c", "City");
    selectBuilder.from("c");
    const generatedQuery = selectBuilder.build();

    expect(generatedQuery).toEqual(expectedQuery);
  });

  it("C. Should select all different countries from Customer table", () => {
    const expectedQuery = "SELECT DISTINCT Country FROM Customer";

    const selectBuilder = new SelectBuilder(
      { c: customerTable },
      {
        useDatabaseName: false,
        useSchemaName: false,
        useTableAlias: false,
      }
    );

    selectBuilder.distinct();
    selectBuilder.selectColumn("c", "Country");
    selectBuilder.from("c");
    const generatedQuery = selectBuilder.build();

    expect(generatedQuery).toEqual(expectedQuery);
  });

  it("C1. Should select the number of different countries from Customer table", () => {
    const expectedQuery = "SELECT COUNT(DISTINCT Country) FROM Customer";

    const selectBuilder = new SelectBuilder(
      { c: customerTable },
      {
        useDatabaseName: false,
        useSchemaName: false,
        useTableAlias: false,
      }
    );

    selectBuilder.distinct();
    const countryRef = selectBuilder.getColumnRef("c", "Country");

    selectBuilder.selectCalculatedRef(Fn.COUNT(countryRef));
    selectBuilder.from("c");
    const generatedQuery = selectBuilder.build();

    expect(generatedQuery).toEqual(expectedQuery);
  });

  it("D. Should select all customers from Mexico", () => {
    const expectedQuery = "SELECT * FROM Customer WHERE Country = 'Mexico'";

    const selectBuilder = new SelectBuilder(
      { c: customerTable },
      {
        useDatabaseName: false,
        useSchemaName: false,
        useTableAlias: false,
      }
    );

    const isFromMexico = selectBuilder
      .getColumnRef("c", "Country")
      .isEqualTo("Mexico");

    selectBuilder.selectAllColumns("c");
    selectBuilder.from("c");
    selectBuilder.where(isFromMexico);

    const generatedQuery = selectBuilder.build();

    expect(generatedQuery).toEqual(expectedQuery);
  });

  it("E. Should select all products ordered by highest to lowest price", () => {
    const expectedQuery =
      "SELECT * FROM Production.Product ORDER BY price DESC";

    const selectBuilder = new SelectBuilder(
      { p: productTable },
      {
        useDatabaseName: false,
        useSchemaName: true,
        useTableAlias: false,
      }
    );

    selectBuilder.selectAllColumns("p");
    selectBuilder.from("p");
    selectBuilder.orderByColumn("p", "price", "DESC");

    const generatedQuery = selectBuilder.build();
    expect(generatedQuery).toEqual(expectedQuery);
  });

  it("F. Should select all products ordered alphabetically by name", () => {
    const expectedQuery =
      "SELECT p.* FROM Production.Product AS p ORDER BY p.name ASC";

    const selectBuilder = new SelectBuilder(
      { p: productTable },
      {
        useDatabaseName: false,
        useSchemaName: true,
        useTableAlias: true,
      }
    );

    selectBuilder.selectAllColumns("p");
    selectBuilder.from("p");
    selectBuilder.orderByColumn("p", "name", "ASC");

    const generatedQuery = selectBuilder.build();
    expect(generatedQuery).toEqual(expectedQuery);
  });

  it("G. Should select all products ordered alphabetically by name and color", () => {
    const expectedQuery =
      "SELECT p.name, p.color, p.price FROM Production.Product AS p ORDER BY p.name ASC, p.color ASC";

    const sb = new SelectBuilder(
      { p: productTable },
      {
        useDatabaseName: false,
        useSchemaName: true,
        useTableAlias: true,
      }
    );

    expect(
      sb
        .selectColumn("p", "name")
        .selectColumn("p", "color")
        .selectColumn("p", "price")
        .from("p")
        .orderByColumn("p", "name", "ASC")
        .orderByColumn("p", "color", "ASC")
        .build()
    ).toEqual(expectedQuery);

    expect(
      sb
        .selectColumns("p", ["name", "color", "price"])
        .from("p")
        .orderByColumn("p", "name", "ASC")
        .orderByColumn("p", "color", "ASC")
        .build()
    ).toEqual(expectedQuery);
  });
});
