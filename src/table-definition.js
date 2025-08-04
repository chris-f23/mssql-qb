/**
 * @template {string} TColumnName
 */
export class TableDefinition {
  /** @readonly @type {string} */
  name;

  /** @readonly @type {string} */
  schema;

  /** @readonly @type {string} */
  database;

  /** @readonly @type {TColumnName[]} */
  columns;

  /**
   * @param {object} params
   * @param {string} params.database - El nombre de la base de datos
   * @param {string} params.schema - El nombre del esquema
   * @param {string} params.name - El nombre de la tabla
   * @param {TColumnName[]} params.columns - Las columnas de la tabla
   */
  constructor({ database, schema, name, columns }) {
    this.database = database;
    this.schema = schema;
    this.name = name;
    this.columns = columns;
  }

  /**
   * @param {Partial<BuildTableOptions>} options
   */
  build({ useDatabaseName, useSchemaName }) {
    let built = "";

    if (useDatabaseName === true) {
      built += `${this.database}.`;
    }

    if (useSchemaName === true) {
      built += `${this.schema}.`;
    } else if (useDatabaseName === true && useSchemaName === false) {
      built += ".";
    }

    built += this.name;

    return built;
  }
}
