import { Fn } from "./src/fn";
import { SelectBuilder } from "./src/select";
import { TableDefinition, Column } from "./src/table-definition";

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
    address: new Column("Address"),
  },
});

new SelectBuilder({
  person: personTable,
  address: addressTable,
})
  .select((tables) => {
    return {
      id: tables.person.id,
      fullname: Fn.concat(tables.person.name, " ", tables.person.lastname),
      age: Fn.datediff("year", tables.person.birthdate, Fn.getdate()),
      address: tables.address.address,
    };
  })
  .from("person")
  .join("address", (tables, joiner) => {
    // TODO: Investigar AND, OR, NOT, etc.
    joiner.on(tables.person.id, "=", tables.address.personId);
    joiner.on(tables.person.birthdate, ">", "2000-01-01");
  });
  // TODO: Investigar WHERE

// export { ... } from "...";
