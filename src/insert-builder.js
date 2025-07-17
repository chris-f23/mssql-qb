import { TableDefinition } from "./table-definition";

/**
 * @template {TableDefinition} Target
 * @template {RowToInsert<Target>} TRow
 */
export class InsertBuilder {
  /**
   * @type {RowToInsertPartialOrRequired<TRow, this["options"]["omitColumnList"]>[]}
   */
  rows = [];

  /**
   * @readonly
   * @type {InsertBuilderOptions}
   */
  options;

  /**
   * @param {Target} target
   * @param {Partial<InsertBuilderOptions>} [options]
   */
  constructor(target, options = {}) {
    this.target = target;
    this.options = {
      useDatabaseName: true,
      useSchemaName: true,
      omitColumnList: false,

      ...options,
    };
  }

  /**
   * @param {RowToInsertPartialOrRequired<TRow, this["options"]["omitColumnList"]>[]} rows
   */
  insertValues(rows) {
    this.rows = rows;
    return this;
  }

  build() {
    if (this.rows.length === 0) {
      throw new Error("No ha indicado valores para insertar");
    }

    const statements = [];

    statements.push(`INSERT INTO ${this.target.build(this.options)} `);

    if (this.options.omitColumnList === false) {
      const columnNames = Object.keys(this.rows[0]).join(", ");
      statements.push(`(${columnNames}) `);
    }

    statements.push("VALUES ");

    const rowStatements = [];
    for (const row of this.rows) {
      const rowValues = Object.values(row)
        .map((r) => r.build())
        .join(", ");

      rowStatements.push(`(${rowValues})`);
    }
    statements.push(rowStatements.join(", "));

    return statements.join("");
  }
}
