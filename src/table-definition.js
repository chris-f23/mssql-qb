/**
 * @template {Record<string, Column>} TColumns
 */
export class TableDefinition {
  /** @readonly @type {string} */
  name;

  /** @readonly @type {string} */
  schema;

  /** @readonly @type {string} */
  database;

  /** @readonly @type {TColumns} */
  columns;

  /**
   * @param {object} params
   * @param {string} params.database - El nombre de la base de datos
   * @param {string} params.schema - El nombre del esquema
   * @param {string} params.name - El nombre de la tabla
   * @param {TColumns} params.columns - Las columnas de la tabla
   */
  constructor({ database, schema, name, columns }) {
    this.database = database;
    this.schema = schema;
    this.name = name;
    this.columns = columns;
  }

  /**
   * @param {object} params
   * @param {boolean} params.useDatabaseName
   * @param {boolean} params.useSchemaName
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

export class Column {
  /** @type {string} */
  name;

  // /** @type {ColumnType} */
  // type;

  /**
   * @param {string} name
   */
  constructor(name) {
    this.name = name;
  }
}
