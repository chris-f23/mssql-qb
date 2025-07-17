import { describe, expect, it } from "@jest/globals";
import { SelectBuilder } from "./select";
import {  TableDefinition } from "./table-definition";
import { LiteralRef } from "./ref";

// https://learn.microsoft.com/en-us/sql/t-sql/queries/search-condition-transact-sql?view=sql-server-ver15
describe("SelectBuilder - WHERE", () => {
  it("Use WHERE with LIKE and ESCAPE syntax", () => {
    const productPhotoTable = new TableDefinition({
      name: "ProductPhoto",
      database: "AdventureWorks2022",
      schema: "Production",
      columns: ["ProductKey", "LargePhotoFileName"],
    });

    const expectedQuery =
      "SELECT * " +
      "FROM Production.ProductPhoto " +
      "WHERE LargePhotoFileName LIKE '%greena_%' ESCAPE 'a'";

    const qb = new SelectBuilder(
      { prodPhoto: productPhotoTable },
      {
        useDatabaseName: false,
        useSchemaName: true,
        useTableAlias: false,
      }
    )
      .select(({ prodPhoto }) => {
        return [prodPhoto.get("*")];
      })
      .from("prodPhoto")
      .where(({ prodPhoto }) => {
        return prodPhoto.get("LargePhotoFileName").$isLike("%greena_%", "a");
      });

    expect(qb.build()).toEqual(expectedQuery);
  });
});
