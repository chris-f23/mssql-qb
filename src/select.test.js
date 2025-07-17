import { describe, expect, it } from "@jest/globals";
import { SelectBuilder } from "./select";
import { TableDefinition } from "./table-definition";
import { Fn } from "./fn";

const pacienteTable = new TableDefinition({
  name: "Paciente",
  database: "BD_PRINCIPAL",
  schema: "dbo",
  columns: [
    "Identificador",
    "Nombre",
    "ApellidoPat",
    "ApellidoMat",
    "FechaNac",
  ],
});

describe("SelectBuilder - SELECT", () => {
  it("Debe seleccionar las primeras 2 columnas", () => {
    const expectedQuery =
      "SELECT pac.Identificador, pac.Nombre FROM BD_PRINCIPAL.dbo.Paciente AS pac";

    const qb = new SelectBuilder({ pac: pacienteTable })
      .select(({ pac }) => {
        return [pac.get("Identificador"), pac.get("Nombre")];
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
          pac.get("Identificador"),
          pac.get("Nombre"),
          pac.get("ApellidoPat"),
          pac.get("ApellidoMat"),
          pac.get("FechaNac"),
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
          pac.get("Identificador").as("Id"),
          pac.get("Nombre").as("Nombre"),
          pac.get("ApellidoPat").as("ApellidoPaterno"),
          pac.get("ApellidoMat").as("ApellidoMaterno"),
          pac.get("FechaNac").as("FechaNacimiento"),
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
            pac.get("Nombre"),
            " ",
            pac.get("ApellidoPat"),
            " ",
            pac.get("ApellidoMat")
          ).as("NombreCompleto"),
        ];
      })
      .from("pac");

    expect(qb.build()).toEqual(expectedQuery);
  });

  it("Debe seleccionar todas las columnas usando el simbolo asterisco", () => {
    const expectedQuery = "SELECT pac.* FROM BD_PRINCIPAL.dbo.Paciente AS pac";

    const qb = new SelectBuilder({ pac: pacienteTable })
      .select(({ pac }) => [pac.get("*")])
      .from("pac");

    expect(qb.build()).toEqual(expectedQuery);
  });

  it("Debe seleccionar 10 registros", () => {
    const expectedQuery =
      "SELECT TOP (10) pac.Identificador FROM BD_PRINCIPAL.dbo.Paciente AS pac";
    const qb = new SelectBuilder({ pac: pacienteTable })
      .select(({ pac }) => [pac.get("Identificador")])
      .top(10)
      .from("pac");

    expect(qb.build()).toEqual(expectedQuery);
  });

  it("Debe seleccionar el 50% de los registros", () => {
    const expectedQuery =
      "SELECT TOP (50) PERCENT pac.Identificador " +
      "FROM BD_PRINCIPAL.dbo.Paciente AS pac";
    const qb = new SelectBuilder({ pac: pacienteTable })
      .select(({ pac }) => [pac.get("Identificador")])
      .top(50, "PERCENT")
      .from("pac");

    expect(qb.build()).toEqual(expectedQuery);
  });

  it("Debe seleccionar los distintos nombres", () => {
    const expectedQuery =
      "SELECT DISTINCT pac.Nombre FROM BD_PRINCIPAL.dbo.Paciente AS pac";

    const qb = new SelectBuilder({ pac: pacienteTable })
      .select(({ pac }) => [pac.get("Nombre")])
      .distinct()
      .from("pac");

    expect(qb.build()).toEqual(expectedQuery);
  });

  it("Debe seleccionar 3 nombres distintos", () => {
    const expectedQuery =
      "SELECT DISTINCT TOP (3) pac.Nombre FROM BD_PRINCIPAL.dbo.Paciente AS pac";

    const qb = new SelectBuilder({ pac: pacienteTable })
      .select(({ pac }) => [pac.get("Nombre")])
      .distinct()
      .top(3)
      .from("pac");

    expect(qb.build()).toEqual(expectedQuery);
  });
});
