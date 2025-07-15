import { describe, expect, it } from "@jest/globals";
import { SelectBuilder } from "./select";
import { Column, TableDefinition } from "./table-definition";
import { Fn } from "./fn";
import { LiteralRef } from "./ref";

const pacienteTable = new TableDefinition({
  name: "Paciente",
  database: "BD_PRINCIPAL",
  schema: "dbo",
  columns: {
    id: new Column("Identificador"),
    nombre: new Column("Nombre"),
    apellidoPaterno: new Column("ApellidoPat"),
    apellidoMaterno: new Column("ApellidoMat"),
    fechaNacimiento: new Column("FechaNac"),
  },
});

describe("SelectBuilder - SELECT", () => {
  it("Debe seleccionar las primeras 2 columnas", () => {
    const expectedQuery =
      "SELECT pac.Identificador, pac.Nombre FROM BD_PRINCIPAL.dbo.Paciente AS pac";

    const qb = new SelectBuilder({ pac: pacienteTable })
      .select(({ pac }) => {
        return [pac.id, pac.nombre];
      })
      .from("pac");

    expect(qb.build()).toEqual(expectedQuery);
  });

  it("Debe seleccionar todas las columnas", () => {
    const expectedQuery =
      "SELECT pac.Identificador, pac.Nombre, pac.ApellidoPat, pac.ApellidoMat, pac.FechaNac FROM BD_PRINCIPAL.dbo.Paciente AS pac";

    const qb = new SelectBuilder({ pac: pacienteTable })
      .select(({ pac }) => {
        return [
          pac.id,
          pac.nombre,
          pac.apellidoPaterno,
          pac.apellidoMaterno,
          pac.fechaNacimiento,
        ];
      })
      .from("pac");

    expect(qb.build()).toEqual(expectedQuery);
  });

  it("Debe seleccionar todas las columnas con alias", () => {
    const expectedQuery =
      "SELECT pac.Identificador AS Id, " +
      "pac.Nombre AS Nombre, " +
      "pac.ApellidoPat AS ApellidoPaterno, " +
      "pac.ApellidoMat AS ApellidoMaterno, " +
      "pac.FechaNac AS FechaNacimiento " +
      "FROM BD_PRINCIPAL.dbo.Paciente AS pac";

    const qb = new SelectBuilder({ pac: pacienteTable })
      .select(({ pac }) => {
        return [
          pac.id.as("Id"),
          pac.nombre.as("Nombre"),
          pac.apellidoPaterno.as("ApellidoPaterno"),
          pac.apellidoMaterno.as("ApellidoMaterno"),
          pac.fechaNacimiento.as("FechaNacimiento"),
        ];
      })
      .from("pac");

    expect(qb.build()).toEqual(expectedQuery);
  });

  it("Debe seleccionar el nombre completo", () => {
    const expectedQuery =
      "SELECT CONCAT(pac.Nombre, ' ', pac.ApellidoPat, ' ', pac.ApellidoMat) AS NombreCompleto " +
      "FROM BD_PRINCIPAL.dbo.Paciente AS pac";

    const qb = new SelectBuilder({ pac: pacienteTable })
      .select(({ pac }) => {
        return [
          Fn.CONCAT(
            pac.nombre,
            " ",
            pac.apellidoPaterno,
            " ",
            pac.apellidoMaterno
          ).as("NombreCompleto"),
        ];
      })
      .from("pac");

    expect(qb.build()).toEqual(expectedQuery);
  });

  it("Debe seleccionar todas las columnas usando el simbolo asterisco", () => {
    const expectedQuery = "SELECT pac.* FROM BD_PRINCIPAL.dbo.Paciente AS pac";

    const qb = new SelectBuilder({ pac: pacienteTable })
      .select(({ pac }) => [pac["*"]])
      .from("pac");

    expect(qb.build()).toEqual(expectedQuery);
  });

  it("Debe seleccionar 10 registros", () => {
    const expectedQuery =
      "SELECT TOP (10) pac.Identificador FROM BD_PRINCIPAL.dbo.Paciente AS pac";
    const qb = new SelectBuilder({ pac: pacienteTable })
      .select(({ pac }) => [pac.id])
      .top(10)
      .from("pac");

    expect(qb.build()).toEqual(expectedQuery);
  });

  it("Debe seleccionar el 50% de los registros", () => {
    const expectedQuery =
      "SELECT TOP (50) PERCENT pac.Identificador " +
      "FROM BD_PRINCIPAL.dbo.Paciente AS pac";
    const qb = new SelectBuilder({ pac: pacienteTable })
      .select(({ pac }) => [pac.id])
      .top(50, "PERCENT")
      .from("pac");

    expect(qb.build()).toEqual(expectedQuery);
  });

  it("Debe seleccionar los distintos nombres", () => {
    const expectedQuery =
      "SELECT DISTINCT pac.Nombre FROM BD_PRINCIPAL.dbo.Paciente AS pac";

    const qb = new SelectBuilder({ pac: pacienteTable })
      .select(({ pac }) => [pac.nombre])
      .distinct()
      .from("pac");

    expect(qb.build()).toEqual(expectedQuery);
  });

  it("Debe seleccionar 3 nombres distintos", () => {
    const expectedQuery =
      "SELECT DISTINCT TOP (3) pac.Nombre FROM BD_PRINCIPAL.dbo.Paciente AS pac";

    const qb = new SelectBuilder({ pac: pacienteTable })
      .select(({ pac }) => [pac.nombre])
      .distinct()
      .top(3)
      .from("pac");

    expect(qb.build()).toEqual(expectedQuery);
  });
});

describe("SelectBuilder - WHERE", () => {
  it("Debe filtrar donde la fecha de nacimiento sea mayor a 2000-01-01", () => {
    const expectedQuery =
      "SELECT pac.* FROM BD_PRINCIPAL.dbo.Paciente AS pac WHERE pac.FechaNac > '2000-01-01'";

    const qb = new SelectBuilder({ pac: pacienteTable })
      .select(({ pac }) => {
        return [pac["*"]];
      })
      .from("pac")
      .where(({ pac }) => {
        return pac.fechaNacimiento.$isGreaterThan(new LiteralRef("2000-01-01"));
      });

    expect(qb.build()).toEqual(expectedQuery);
  });
});
