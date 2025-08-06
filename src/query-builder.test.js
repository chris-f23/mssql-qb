import { describe, expect, it } from "@jest/globals";
import { QueryBuilder } from "./query-builder";
import { TableDefinition } from "./table-definition";
import { Logical } from "./logical";
import { Fn } from "./fn";

const productTable = new TableDefinition({
  name: "Product",
  database: "AdventureWorks2022",
  schema: "Production",
  columns: [
    "ProductID",
    "Name",
    "ProductNumber",
    "ListPrice",
    "Color",
    "ProductModelID",
  ],
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

const productModelTable = new TableDefinition({
  name: "ProductModel",
  database: "AdventureWorks2022",
  schema: "Production",
  columns: ["ProductModelID", "Name"],
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
      .select((q1) => {
        // Referencias
        const nonDiscountSalesRef = q1
          .getColumnRef("sod", "OrderQty")
          .multipliedBy(q1.getColumnRef("sod", "UnitPrice"));

        const discountsRef = q1
          .getColumnRef("sod", "OrderQty")
          .multipliedBy(q1.getColumnRef("sod", "UnitPrice"))
          .multipliedBy(q1.getColumnRef("sod", "UnitPriceDiscount"));

        const productNameRef = q1.selectColumn("p", "Name", "ProductName");

        const isSameProductId = q1
          .getColumnRef("p", "ProductID")
          .isEqualTo(q1.getColumnRef("sod", "ProductID"));

        // SELECT
        q1.selectCalculatedRef(nonDiscountSalesRef, "NonDiscountSales");
        q1.selectCalculatedRef(discountsRef, "Discounts");

        // FROM
        q1.from("p");

        // INNER JOIN
        q1.innerJoin("sod", isSameProductId);

        // ORDER BY
        q1.orderByRef(productNameRef, "DESC");
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

  it("D. Select into temporary table", () => {
    const expectedQuery =
      "SELECT * " +
      "INTO #Bicycles " +
      "FROM AdventureWorks2022.Production.Product " +
      "WHERE ProductNumber LIKE 'BK%'";

    const tempBicyclesTable = new TableDefinition({
      database: "tempdb",
      schema: "dbo",
      name: "#Bicycles",
      columns: ["Id", "Name"],
    });

    const generatedQuery = new QueryBuilder(
      { p: productTable, temp: tempBicyclesTable },
      {
        useDatabaseName: true,
        useSchemaName: true,
        useTableAlias: false,
      }
    )
      .select((helper) => {
        // Referencias
        const productNumberLikeBK = helper
          .getColumnRef("p", "ProductNumber")
          .isLike(`BK%`);

        // Query
        helper.selectAllColumns("p");
        helper.into("temp", { useDatabaseName: false, useSchemaName: false });
        helper.from("p");
        helper.where(productNumberLikeBK);
      })
      .build();

    expect(generatedQuery).toEqual(expectedQuery);
  });

  it("D1. Select into non temporary table", () => {
    const expectedQuery =
      "SELECT * " +
      "INTO dbo.NewProducts " +
      "FROM Production.Product " +
      "WHERE ListPrice > 25 " +
      "AND ListPrice < 100";

    const newProductsTable = new TableDefinition({
      database: "AdventureWorks2022",
      schema: "dbo",
      name: "NewProducts",
      columns: ["Id", "Name"],
    });

    const generatedQuery = new QueryBuilder(
      { p: productTable, newProds: newProductsTable },
      {
        useDatabaseName: false,
        useSchemaName: true,
        useTableAlias: false,
      }
    )
      .select((helper) => {
        // Referencias
        const listPriceGreaterThan25 = helper
          .getColumnRef("p", "ListPrice")
          .isGreaterThan(25);

        const listPriceLessThan100 = helper
          .getColumnRef("p", "ListPrice")
          .isLessThan(100);

        // Query
        helper.selectAllColumns("p");
        helper.into("newProds", {
          useDatabaseName: false,
          useSchemaName: true,
        });
        helper.from("p");
        helper.where(Logical.and(listPriceGreaterThan25, listPriceLessThan100));
      })
      .build();

    expect(generatedQuery).toEqual(expectedQuery);
  });

  it("E. Use correlated subqueries", () => {
    const expectedQuery =
      "SELECT DISTINCT p.Name " +
      "FROM Production.Product AS p " +
      "WHERE EXISTS (SELECT pm.* " +
      "FROM Production.ProductModel AS pm " +
      "WHERE p.ProductModelID = pm.ProductModelID " +
      "AND pm.Name LIKE 'Long-Sleeve Logo Jersey%')";

    const generatedQuery = new QueryBuilder(
      { p: productTable, pm: productModelTable },
      {
        useDatabaseName: false,
        useSchemaName: true,
        useTableAlias: true,
      }
    )
      .select((q1) => {
        // Referencias
        const productModelSubquery = q1.createSubquery((q2) => {
          const isSameProductModelId = q2
            .getColumnRef("p", "ProductModelID")
            .isEqualTo(q1.getColumnRef("pm", "ProductModelID"));

          const productModelNameLike = q2
            .getColumnRef("pm", "Name")
            .isLike(`Long-Sleeve Logo Jersey%`);

          q2.selectAllColumns("pm");
          q2.from("pm");
          q2.where(Logical.and(isSameProductModelId, productModelNameLike));
        });

        // Query
        q1.distinct();
        q1.selectColumn("p", "Name");
        q1.from("p");
        q1.where(Logical.exists(productModelSubquery));
      })
      .build();

    expect(generatedQuery).toEqual(expectedQuery);
  });

  it("E1. Use correlated subqueries with IN instead of EXISTS", () => {
    const expectedQuery =
      "SELECT DISTINCT p.Name " +
      "FROM Production.Product AS p " +
      "WHERE p.ProductModelID IN (SELECT pm.ProductModelID " +
      "FROM Production.ProductModel AS pm " +
      "WHERE p.ProductModelID = pm.ProductModelID " +
      "AND pm.Name LIKE 'Long-Sleeve Logo Jersey%')";

    const generatedQuery = new QueryBuilder(
      { p: productTable, pm: productModelTable },
      {
        useDatabaseName: false,
        useSchemaName: true,
        useTableAlias: true,
      }
    )
      .select((q1) => {
        // Referencias
        const productModelSubquery = q1.createSubquery((q2) => {
          const isSameProductModelId = q2
            .getColumnRef("p", "ProductModelID")
            .isEqualTo(q1.getColumnRef("pm", "ProductModelID"));

          const productModelNameLike = q2
            .getColumnRef("pm", "Name")
            .isLike(`Long-Sleeve Logo Jersey%`);

          q2.selectColumn("pm", "ProductModelID");
          q2.from("pm");
          q2.where(Logical.and(isSameProductModelId, productModelNameLike));
        });

        // Query
        q1.distinct();
        q1.selectColumn("p", "Name");
        q1.from("p");
        q1.where(
          Logical.in(
            q1.getColumnRef("p", "ProductModelID"),
            productModelSubquery
          )
        );
      })
      .build();

    expect(generatedQuery).toEqual(expectedQuery);
  });

  it("F. Use GROUP BY", () => {
    const expectedQuery =
      "SELECT p.Name, COUNT(p.*) AS ProductCount " +
      "FROM Production.Product AS p " +
      "GROUP BY p.Name";

    const generatedQuery = new QueryBuilder(
      { p: productTable },
      {
        useDatabaseName: false,
        useSchemaName: true,
        useTableAlias: true,
      }
    )
      .select((q1) => {
        // Referencias
        const nameRef = q1.getColumnRef("p", "Name");
        const productCountRef = Fn.COUNT(q1.getStarRef("p"));

        // Query
        q1.selectCalculatedRef(nameRef);
        q1.selectCalculatedRef(productCountRef, "ProductCount");
        q1.from("p");
        q1.groupByRef(nameRef);
      })
      .build();

    expect(generatedQuery).toEqual(expectedQuery);
  });

  it("H. Use GROUP BY and WHERE", () => {
    const expectedQuery =
      "SELECT ProductModelID, " +
      "AVG(ListPrice) AS [Average List Price] " +
      "FROM Production.Product " +
      "WHERE ListPrice > 1000 " +
      "GROUP BY ProductModelID " +
      "ORDER BY ProductModelID";

    const generatedQuery = new QueryBuilder(
      { p: productTable },
      {
        useDatabaseName: false,
        useSchemaName: true,
        useTableAlias: false,
      }
    )
      .select((q1) => {
        // Referencias
        const productModelIdRef = q1.getColumnRef("p", "ProductModelID");
        const averageListPriceRef = Fn.AVG(q1.getColumnRef("p", "ListPrice"));

        // Query
        q1.selectCalculatedRef(productModelIdRef);
        q1.selectCalculatedRef(averageListPriceRef, "[Average List Price]");
        q1.from("p");
        q1.where(q1.getColumnRef("p", "ListPrice").isGreaterThan(1000));
        q1.groupByRef(productModelIdRef);
        q1.orderByRef(productModelIdRef);
      })
      .build();

    expect(generatedQuery).toEqual(expectedQuery);
  });
});
