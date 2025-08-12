import { describe, expect, it } from "@jest/globals";
import { QueryFactory } from "./query-factory";
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
    "SalesOrderID",
    "CarrierTrackingNumber",
  ],
});

const tempBicyclesTable = new TableDefinition({
  database: "tempdb",
  schema: "dbo",
  name: "#Bicycles",
  columns: ["Id", "Name"],
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

const productOnlyQueryFactory = new QueryFactory({
  p: productTable,
});

const salesOrderDetailOnlyQueryFactory = new QueryFactory({
  sod: salesOrderDetailTable,
});

const productAndProductModelQueryFactory = new QueryFactory({
  p: productTable,
  pm: productModelTable,
});

describe("QueryFactory", () => {
  describe("Select", () => {
    it("A. Use SELECT to retrieve rows and columns", () => {
      const expectedQuery =
        "SELECT * FROM Production.Product ORDER BY Name ASC";

      const generatedQuery = productOnlyQueryFactory.createInlineSelectQuery(
        {
          useDatabaseName: false,
          useSchemaName: true,
          useTableAlias: false,
        },
        (qb) => {
          qb.selectAllColumns("p");
          qb.from("p");
          qb.orderByColumn("p", "Name", "ASC");
        }
      );

      expect(generatedQuery).toEqual(expectedQuery);
    });

    it("A1. Use SELECT to retrieve rows and columns, alternate way", () => {
      const expectedQuery =
        "SELECT p.* FROM Production.Product AS p ORDER BY p.Name ASC";

      const generatedQuery = productOnlyQueryFactory.createInlineSelectQuery(
        {
          useDatabaseName: false,
          useSchemaName: true,
          useTableAlias: true,
        },
        (qb) => {
          qb.selectAllColumns("p");
          qb.from("p");
          qb.orderByColumn("p", "Name", "ASC");
        }
      );

      expect(generatedQuery).toEqual(expectedQuery);
    });

    it("A2. Select all rows, and only a subset of the columns", () => {
      const expectedQuery =
        "SELECT Name, ProductNumber, ListPrice AS Price FROM Production.Product ORDER BY Name ASC";

      const generatedQuery = productOnlyQueryFactory.createInlineSelectQuery(
        {
          useDatabaseName: false,
          useSchemaName: true,
          useTableAlias: false,
        },
        (qb) => {
          qb.selectColumn("p", "Name");
          qb.selectColumn("p", "ProductNumber");
          qb.selectColumn("p", "ListPrice", "Price");
          qb.from("p");
          qb.orderByColumn("p", "Name", "ASC");
        }
      );

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

      const generatedQuery = new QueryFactory({
        p: productTable,
        sod: salesOrderDetailTable,
      }).createInlineSelectQuery(
        {
          useDatabaseName: false,
          useSchemaName: true,
          useTableAlias: true,
        },
        (qb) => {
          // Referencias
          const nonDiscountSalesRef = qb
            .getColumnRef("sod", "OrderQty")
            .multipliedBy(qb.getColumnRef("sod", "UnitPrice"));

          const discountsRef = qb
            .getColumnRef("sod", "OrderQty")
            .multipliedBy(qb.getColumnRef("sod", "UnitPrice"))
            .multipliedBy(qb.getColumnRef("sod", "UnitPriceDiscount"));

          const productNameRef = qb.getColumnRef("p", "Name", "ProductName");

          const isSameProductId = qb
            .getColumnRef("p", "ProductID")
            .isEqualTo(qb.getColumnRef("sod", "ProductID"));

          qb.selectColumnRef(productNameRef);
          qb.selectCalculatedRef(nonDiscountSalesRef, "NonDiscountSales");
          qb.selectCalculatedRef(discountsRef, "Discounts");
          qb.from("p");
          qb.innerJoin("sod", isSameProductId);
          qb.orderByRef(productNameRef, "DESC");
        }
      );

      expect(generatedQuery).toEqual(expectedQuery);
    });

    it("C. Use DISTINCT with SELECT", () => {
      const expectedQuery =
        "SELECT DISTINCT JobTitle " +
        "FROM HumanResources.Employee " +
        "ORDER BY JobTitle";

      const generatedQuery = new QueryFactory({
        e: employeeTable,
      }).createInlineSelectQuery(
        {
          useDatabaseName: false,
          useSchemaName: true,
          useTableAlias: false,
        },
        (qb) => {
          qb.distinct();
          qb.selectColumn("e", "JobTitle");
          qb.from("e");
          qb.orderByColumn("e", "JobTitle");
        }
      );

      expect(generatedQuery).toEqual(expectedQuery);
    });

    it("D. Select into temporary table", () => {
      const expectedQuery =
        "SELECT * " +
        "INTO #Bicycles " +
        "FROM AdventureWorks2022.Production.Product " +
        "WHERE ProductNumber LIKE 'BK%'";

      const generatedQuery = new QueryFactory({
        p: productTable,
        temp: tempBicyclesTable,
      }).createInlineSelectQuery(
        {
          useDatabaseName: true,
          useSchemaName: true,
          useTableAlias: false,
        },
        (qb) => {
          // Referencias
          const productNumberLikeBK = qb
            .getColumnRef("p", "ProductNumber")
            .isLike(`BK%`);

          // Query
          qb.selectAllColumns("p");
          qb.into("temp", {
            useDatabaseName: false,
            useSchemaName: false,
          });
          qb.from("p");
          qb.where(productNumberLikeBK);
        }
      );

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

      const generatedQuery = new QueryFactory({
        p: productTable,
        newProds: newProductsTable,
      }).createInlineSelectQuery(
        {
          useDatabaseName: false,
          useSchemaName: true,
          useTableAlias: false,
        },
        (qb) => {
          // Referencias
          const listPriceGreaterThan25 = qb
            .getColumnRef("p", "ListPrice")
            .isGreaterThan(25);

          const listPriceLessThan100 = qb
            .getColumnRef("p", "ListPrice")
            .isLessThan(100);

          // Query
          qb.selectAllColumns("p");
          qb.into("newProds", {
            useDatabaseName: false,
            useSchemaName: true,
          });
          qb.from("p");
          qb.where(Logical.and(listPriceGreaterThan25, listPriceLessThan100));
        }
      );

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

      const generatedQuery =
        productAndProductModelQueryFactory.createInlineSelectQuery(
          {
            useDatabaseName: false,
            useSchemaName: true,
            useTableAlias: true,
          },
          (q1) => {
            // Referencias
            const subqueryRef = q1.createInlineSubqueryRef((q2) => {
              const isSameProductModelId = q2
                .getColumnRef("p", "ProductModelID")
                .isEqualTo(q2.getColumnRef("pm", "ProductModelID"));

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
            q1.where(Logical.exists(subqueryRef));
          }
        );

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

      const generatedQuery =
        productAndProductModelQueryFactory.createInlineSelectQuery(
          {
            useDatabaseName: false,
            useSchemaName: true,
            useTableAlias: true,
          },
          (qb) => {
            // Referencias
            const productModelSubquery = qb.createInlineSubqueryRef((sq1) => {
              const isSameProductModelId = sq1
                .getColumnRef("p", "ProductModelID")
                .isEqualTo(qb.getColumnRef("pm", "ProductModelID"));

              const productModelNameLike = sq1
                .getColumnRef("pm", "Name")
                .isLike(`Long-Sleeve Logo Jersey%`);

              sq1.selectColumn("pm", "ProductModelID");
              sq1.from("pm");
              sq1.where(
                Logical.and(isSameProductModelId, productModelNameLike)
              );
            });

            // Query
            qb.distinct();
            qb.selectColumn("p", "Name");
            qb.from("p");
            qb.where(
              Logical.in(
                qb.getColumnRef("p", "ProductModelID"),
                productModelSubquery
              )
            );
          }
        );

      expect(generatedQuery).toEqual(expectedQuery);
    });

    it("F. Use GROUP BY", () => {
      const expectedQuery =
        "SELECT p.Name, COUNT(p.*) AS ProductCount " +
        "FROM Production.Product AS p " +
        "GROUP BY p.Name";

      const generatedQuery = productOnlyQueryFactory.createInlineSelectQuery(
        {
          useDatabaseName: false,
          useSchemaName: true,
          useTableAlias: true,
        },
        (qb) => {
          // Referencias
          const nameRef = qb.getColumnRef("p", "Name");
          const productCountRef = Fn.COUNT(qb.getColumnRef("p", "*"));

          // Query
          qb.selectCalculatedRef(nameRef);
          qb.selectCalculatedRef(productCountRef, "ProductCount");
          qb.from("p");
          qb.groupByRef(nameRef);
        }
      );

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

      const generatedQuery = productOnlyQueryFactory.createInlineSelectQuery(
        {
          useDatabaseName: false,
          useSchemaName: true,
          useTableAlias: false,
        },
        (qb) => {
          // Referencias
          const productModelIdRef = qb.getColumnRef("p", "ProductModelID");
          const averageListPriceRef = Fn.AVG(qb.getColumnRef("p", "ListPrice"));

          // Query
          qb.selectCalculatedRef(productModelIdRef);
          qb.selectCalculatedRef(averageListPriceRef, "[Average List Price]");
          qb.from("p");
          qb.where(qb.getColumnRef("p", "ListPrice").isGreaterThan(1000));
          qb.groupByRef(productModelIdRef);
          qb.orderByRef(productModelIdRef);
        }
      );

      expect(generatedQuery).toEqual(expectedQuery);
    });

    it("I. Use GROUP BY with an expression", () => {
      const expectedQuery =
        "SELECT AVG(OrderQty) AS [Average Quantity], " +
        "(OrderQty * UnitPrice) AS NonDiscountSales " +
        "FROM Sales.SalesOrderDetail " +
        "GROUP BY (OrderQty * UnitPrice) " +
        "ORDER BY (OrderQty * UnitPrice) DESC";

      const generatedQuery =
        salesOrderDetailOnlyQueryFactory.createInlineSelectQuery(
          {
            useDatabaseName: false,
            useSchemaName: true,
            useTableAlias: false,
          },
          (qb) => {
            const averageQuantityRef = Fn.AVG(
              qb.getColumnRef("sod", "OrderQty")
            );
            const nonDiscountSalesRef = qb
              .getColumnRef("sod", "OrderQty")
              .multipliedBy(qb.getColumnRef("sod", "UnitPrice"));

            // Query
            qb.selectCalculatedRef(averageQuantityRef, "[Average Quantity]");
            qb.selectCalculatedRef(nonDiscountSalesRef, "NonDiscountSales");
            qb.from("sod");
            qb.groupByRef(nonDiscountSalesRef);
            qb.orderByRef(nonDiscountSalesRef, "DESC");
          }
        );

      expect(generatedQuery).toEqual(expectedQuery);
    });

    it("J. Use GROUP BY with ORDER BY", () => {
      const expectedQuery =
        "SELECT ProductID, " +
        "AVG(UnitPrice) AS [Average Price] " +
        "FROM Sales.SalesOrderDetail " +
        "WHERE OrderQty > 10 " +
        "GROUP BY ProductID " +
        "ORDER BY AVG(UnitPrice)";

      const generatedQuery =
        salesOrderDetailOnlyQueryFactory.createInlineSelectQuery(
          {
            useDatabaseName: false,
            useSchemaName: true,
            useTableAlias: false,
          },
          (qb) => {
            // Referencias
            const productIdRef = qb.getColumnRef("sod", "ProductID");
            const averagePriceRef = Fn.AVG(qb.getColumnRef("sod", "UnitPrice"));

            // Query
            qb.selectCalculatedRef(productIdRef);
            qb.selectCalculatedRef(averagePriceRef, "[Average Price]");
            qb.from("sod");
            qb.where(qb.getColumnRef("sod", "OrderQty").isGreaterThan(10));
            qb.groupByRef(productIdRef);
            qb.orderByRef(averagePriceRef);
          }
        );

      expect(generatedQuery).toEqual(expectedQuery);
    });

    it("K. Use the HAVING clause", () => {
      const expectedQuery =
        "SELECT ProductID " +
        "FROM Sales.SalesOrderDetail " +
        "GROUP BY ProductID " +
        "HAVING AVG(OrderQty) > 5 " +
        "ORDER BY ProductID";

      const generatedQuery =
        salesOrderDetailOnlyQueryFactory.createInlineSelectQuery(
          {
            useDatabaseName: false,
            useSchemaName: true,
            useTableAlias: false,
          },
          (qb) => {
            // Referencias
            const productIdRef = qb.getColumnRef("sod", "ProductID");
            const averageOrderQtyRef = Fn.AVG(
              qb.getColumnRef("sod", "OrderQty")
            );

            // Query
            qb.selectCalculatedRef(productIdRef);
            qb.from("sod");
            qb.groupByRef(productIdRef);
            qb.having(averageOrderQtyRef.isGreaterThan(5));
            qb.orderByRef(productIdRef);
          }
        );

      expect(generatedQuery).toEqual(expectedQuery);
    });

    it("K1. Use the HAVING clause with a LIKE expression", () => {
      const expectedQuery =
        "SELECT SalesOrderID, CarrierTrackingNumber " +
        "FROM Sales.SalesOrderDetail " +
        "GROUP BY SalesOrderID, CarrierTrackingNumber " +
        "HAVING CarrierTrackingNumber LIKE '4BD%' " +
        "ORDER BY SalesOrderID";

      const generatedQuery =
        salesOrderDetailOnlyQueryFactory.createInlineSelectQuery(
          {
            useDatabaseName: false,
            useSchemaName: true,
            useTableAlias: false,
          },
          (qb) => {
            // Referencias
            const salesOrderIdRef = qb.getColumnRef("sod", "SalesOrderID");
            const carrierTrackingNumberRef = qb.getColumnRef(
              "sod",
              "CarrierTrackingNumber"
            );

            // Query
            qb.selectCalculatedRef(salesOrderIdRef);
            qb.selectCalculatedRef(carrierTrackingNumberRef);
            qb.from("sod");
            qb.groupByRef(salesOrderIdRef, carrierTrackingNumberRef);
            qb.having(carrierTrackingNumberRef.isLike("4BD%"));
            qb.orderByRef(salesOrderIdRef);
          }
        );

      expect(generatedQuery).toEqual(expectedQuery);
    });

    it("L. Use HAVING and GROUP BY", () => {
      const generatedQuery =
        "SELECT ProductID " +
        "FROM Sales.SalesOrderDetail " +
        "WHERE UnitPrice < 25 " +
        "GROUP BY ProductID " +
        "HAVING AVG(OrderQty) > 5 " +
        "ORDER BY ProductID";

      const expectedQuery =
        salesOrderDetailOnlyQueryFactory.createInlineSelectQuery(
          {
            useDatabaseName: false,
            useSchemaName: true,
            useTableAlias: false,
          },
          (qb) => {
            // Referencias
            const productIdRef = qb.getColumnRef("sod", "ProductID");
            const averageOrderQtyRef = Fn.AVG(
              qb.getColumnRef("sod", "OrderQty")
            );
            const unitPriceRef = qb.getColumnRef("sod", "UnitPrice");

            // Query
            qb.selectCalculatedRef(productIdRef);
            qb.from("sod");
            qb.where(unitPriceRef.isLessThan(25));
            qb.groupByRef(productIdRef);
            qb.having(averageOrderQtyRef.isGreaterThan(5));
            qb.orderByRef(productIdRef);
          }
        );

      expect(generatedQuery).toEqual(expectedQuery);
    });
  });
});
