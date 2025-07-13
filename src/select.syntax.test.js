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

const expectedQuery =
  "SELECT person.Id AS personId, " +
  "UPPER(CONCAT(person.Name, ' ', person.Lastname)) AS personFullname, " +
  "DATEDIFF(year, person.DateOfBirth, GETDATE()) AS personAge, " +
  "CONCAT(address.Line, ', ', address.City) AS fullAddress " +
  "FROM MAIN_DB.dbo.Person AS person " +
  "JOIN MAIN_DB.dbo.Address AS address ON person.Id = address.PersonId " +
  "WHERE person.DateOfBirth > '2000-01-01' AND person.DateOfBirth < '2020-01-01'";

describe("Select", () => {
  it("Debe construir la consulta esperada usando encadenamiento de métodos", () => {
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

        const fullAddress = Fn.CONCAT(address.line, ", ", address.city).as(
          "fullAddress"
        );

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

    expect(qb.build()).toEqual(expectedQuery);
  });

  it("Debe construir la consulta esperada sin usar encadenamiento de métodos", () => {
    const qb = new SelectBuilder({
      person: personTable,
      address: addressTable,
    });

    qb.select(({ person, address }) => {
      const personId = person.id.as("personId");
      const personFullname = Fn.UPPER(
        Fn.CONCAT(person.name, " ", person.lastname)
      ).as("personFullname");

      const personAge = Fn.DATEDIFF("year", person.birthdate, Fn.GETDATE()).as(
        "personAge"
      );

      const fullAddress = Fn.CONCAT(address.line, ", ", address.city).as(
        "fullAddress"
      );

      return [personId, personFullname, personAge, fullAddress];
    });

    qb.from("person");

    qb.join("address", ({ person, address }) => {
      const isSamePerson = new Comparison(person.id, "=", address.personId);
      return isSamePerson;
    });

    qb.where(({ person }) => {
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

    expect(qb.build()).toEqual(expectedQuery);
  });

  it("Debe construir la consulta esperada con menos código en cada callback", () => {
    const qb = new SelectBuilder({
      person: personTable,
      address: addressTable,
    })
      .select(({ person, address }) => [
        person.id.as("personId"),
        Fn.UPPER(Fn.CONCAT(person.name, " ", person.lastname)).as(
          "personFullname"
        ),
        Fn.DATEDIFF("year", person.birthdate, Fn.GETDATE()).as("personAge"),
        Fn.CONCAT(address.line, ", ", address.city).as("fullAddress"),
      ])
      .from("person")
      .join(
        "address",
        ({ person, address }) =>
          new Comparison(person.id, "=", address.personId)
      )
      .where(
        ({ person }) =>
          new Condition(
            new Comparison(person.birthdate, ">", new ValueRef("2000-01-01")),
            "AND",
            new Comparison(person.birthdate, "<", new ValueRef("2020-01-01"))
          )
      );

    expect(qb.build()).toEqual(expectedQuery);
  });

  it("Debe construir la consulta esperada aprovechando encadenamiento de métodos en la construcción de condiciones", () => {
    const year2000Ref = new ValueRef("2000-01-01");
    const year2020Ref = new ValueRef("2020-01-01");

    const qb = new SelectBuilder({
      person: personTable,
      address: addressTable,
    })
      .select(({ person, address }) => [
        person.id.as("personId"),
        Fn.UPPER(Fn.CONCAT(person.name, " ", person.lastname)).as(
          "personFullname"
        ),
        Fn.DATEDIFF("year", person.birthdate, Fn.GETDATE()).as("personAge"),
        Fn.CONCAT(address.line, ", ", address.city).as("fullAddress"),
      ])
      .from("person")
      .join("address", ({ person, address }) =>
        person.id.$isEqualTo(address.personId)
      )
      .where(({ person }) =>
        person.birthdate
          .$isGreaterThan(year2000Ref)
          .$and(person.birthdate.$isLessThan(year2020Ref))
      );

    expect(qb.build()).toEqual(expectedQuery);
  });
});
