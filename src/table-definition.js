/**
 * @template {Record<string, Column>} TColumns
 */
export class TableDefinition {
  /** @type {string} */
  name;

  /** @type {string} */
  schema;

  /** @type {string} */
  database;

  /** @type {TColumns} */
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

  build() {
    return `${this.database}.${this.schema}.${this.name}`;
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
