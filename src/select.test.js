import { describe, it, expect } from "@jest/globals";
import { Fn } from "./fn";
import { ValueRef } from "./ref";
import { Comparison, Condition } from "./search-condition";
import { SelectBuilder } from "./select";
import { TableDefinition, Column } from "./table-definition";

const personTable = new TableDefinition({
  name: "Person",
  schema: "dbo",
  database: "MAIN_DB",
  columns: {
    id: new Column("Id"),
    name: new Column("Name"),
    lastname: new Column("Lastname"),
    birthdate: new Column("DateOfBirth"),
  },
});

const addressTable = new TableDefinition({
  name: "Address",
  schema: "dbo",
  database: "MAIN_DB",
  columns: {
    id: new Column("Id"),
    personId: new Column("PersonId"),
    line: new Column("Line"),
    city: new Column("City"),
  },
});

describe("Select", () => {
  it("Debe construir la misma consulta esperada", () => {
    const qb = new SelectBuilder({
      person: personTable,
      address: addressTable,
    })
      .select(({ person, address }) => {
        const personId = person.id.as("personId");
        const personFullname = Fn.UPPER(
          Fn.CONCAT(person.name, " ", person.lastname)
        ).as("personFullname");

        const personAge = Fn.DATEDIFF(
          "year",
          person.birthdate,
          Fn.GETDATE()
        ).as("personAge");

        const fullAddress = Fn.CONCAT(address.line, ", ", address.city);

        return [personId, personFullname, personAge, fullAddress];
      })
      .from("person")
      .join("address", ({ person, address }) => {
        const isSamePerson = new Comparison(person.id, "=", address.personId);
        return isSamePerson;
      })
      .where(({ person }) => {
        const isBornAfter2000 = new Comparison(
          person.birthdate,
          ">",
          new ValueRef("2000-01-01")
        );
        const isBornBefore2020 = new Comparison(
          person.birthdate,
          "<",
          new ValueRef("2020-01-01")
        );

        return new Condition(isBornAfter2000, "AND", isBornBefore2020);
      });

    expect(qb.build()).toEqual(
      "SELECT person.id AS personId, " +
        "UPPER(CONCAT(person.name, ' ', person.lastname)) AS personFullname, " +
        "DATEDIFF(year, person.birthdate, GETDATE()) AS personAge, " +
        "CONCAT(address.line, ', ', address.city) AS fullAddress " +
        "FROM MAIN_DB.dbo.Person AS person " +
        "JOIN MAIN_DB.dbo.Address AS address ON person.id = address.personId " +
        "WHERE person.birthdate > '2000-01-01' AND person.birthdate < '2020-01-01'"
    );
  });
});
