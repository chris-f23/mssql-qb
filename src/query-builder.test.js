import { describe, expect, it } from "@jest/globals";
import { QueryBuilder } from "./query-builder";
import { TableDefinition } from "./table-definition";

const productTable = new TableDefinition({
  name: "Product",
  database: "AdventureWorks2022",
  schema: "Production",
  columns: ["ProductID", "Name", "ProductNumber", "ListPrice", "Color"],
});

const salesOrderDetailTable = new TableDefinition({
  name: "SalesOrderDetail",
  database: "AdventureWorks2022",
  schema: "Sales",
  columns: [
    "SalesOrderID",
    "OrderQty",
    "ProductID",
    "UnitPrice",
    "UnitPriceDiscount",
  ],
});

const employeeTable = new TableDefinition({
  name: "Employee",
  database: "AdventureWorks2022",
  schema: "HumanResources",
  columns: ["JobTitle"],
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
        helper.selectAllColumns("p");
        helper.from("p");
        helper.orderByColumn("p", "Name", "ASC");
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
        helper.selectAllColumns("p");
        helper.from("p");
        helper.orderByColumn("p", "Name", "ASC");
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
        helper.orderByColumn("p", "Name", "ASC");
      })
      .build();

    expect(generatedQuery).toEqual(expectedQuery);
  });

  it("B. Use SELECT with column headings and calculations", () => {
    const expectedQuery =
      "SELECT p.Name AS ProductName, " +
      "(sod.OrderQty * sod.UnitPrice) AS NonDiscountSales, " +
      "((sod.OrderQty * sod.UnitPrice) * sod.UnitPriceDiscount) AS Discounts " +
      "FROM Production.Product AS p " +
      "INNER JOIN Sales.SalesOrderDetail AS sod " +
      "ON p.ProductID = sod.ProductID " +
      "ORDER BY ProductName DESC";

    const generatedQuery = new QueryBuilder(
      { p: productTable, sod: salesOrderDetailTable },
      {
        useDatabaseName: false,
        useSchemaName: true,
        useTableAlias: true,
      }
    )
      .select((helper) => {
        // (REFERENCIAS)
        const nonDiscountSalesRef = helper
          .getColumnRef("sod", "OrderQty")
          .$multiplyBy(helper.getColumnRef("sod", "UnitPrice"));

        const discountsRef = helper
          .getColumnRef("sod", "OrderQty")
          .$multiplyBy(helper.getColumnRef("sod", "UnitPrice"))
          .$multiplyBy(helper.getColumnRef("sod", "UnitPriceDiscount"));

        const productNameRef = helper.selectColumn("p", "Name", "ProductName");

        const isSameProductId = helper
          .getColumnRef("p", "ProductID")
          .$isEqualTo(helper.getColumnRef("sod", "ProductID"));

        // SELECT
        helper.selectCalculatedRef(nonDiscountSalesRef, "NonDiscountSales");
        helper.selectCalculatedRef(discountsRef, "Discounts");

        // FROM
        helper.from("p");

        // INNER JOIN
        helper.innerJoin("sod", isSameProductId);

        // ORDER BY
        helper.orderByRef(productNameRef, "DESC");
      })
      .build();

    expect(generatedQuery).toEqual(expectedQuery);
  });

  it("C. Use DISTINCT with SELECT", () => {
    const expectedQuery =
      "SELECT DISTINCT JobTitle " +
      "FROM HumanResources.Employee " +
      "ORDER BY JobTitle";

    const generatedQuery = new QueryBuilder(
      { e: employeeTable },
      {
        useDatabaseName: false,
        useSchemaName: true,
        useTableAlias: false,
      }
    )
      .select((helper) => {
        helper.distinct();
        helper.selectColumn("e", "JobTitle");
        helper.from("e");
        helper.orderByColumn("e", "JobTitle");
      })
      .build();

    expect(generatedQuery).toEqual(expectedQuery);
  });
});
