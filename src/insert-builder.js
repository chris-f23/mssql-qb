import { LiteralRef, Ref } from "./ref";
import { TableDefinition } from "./table-definition";

/**
 * @template {TableDefinition} Target
 * @template {Target["columns"][number]} TargetColumn
 */
export class InsertBuilder {
  /**
   * @type {Array<TargetColumn>}
   */
  columns = [];

  /**
   * @private
   * @type {Array<Record<this["target"]["columns"][number], TValue>>}
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
      ...options,
    };
  }

  /**
   * @template {Array<TargetColumn>} TColumnList
   * @param {object} params
   * @param {TColumnList} [params.columns]
   * @param {Array<Record<TColumnList extends undefined ? this["target"]["columns"][number] : TColumnList[number], TValue>>} params.rows
   */
  insert(params) {
    this.rows = params.rows;
    if (params.columns) {
      this.columns = params.columns;
    }
    return this;
  }

  build() {
    if (this.rows.length === 0) {
      throw new Error("No ha indicado valores para insertar");
    }

    const statements = [];

    statements.push(`INSERT INTO ${this.target.build(this.options)} `);

    if (this.columns.length > 0) {
      statements.push(`(${this.columns.join(", ")}) `);
    }

    statements.push("VALUES ");

    /** @type {Array<TargetColumn>} */
    const actualColumnList =
      this.columns.length > 0 ? this.columns : this.target.columns;

    const rowStatements = [];
    for (const row of this.rows) {
      const rowValues = [];
      for (const columnName of actualColumnList) {
        const value = row[columnName];
        if (value === undefined) {
          continue;
        }

        if (value instanceof Ref) {
          rowValues.push(value.build());
        } else {
          rowValues.push(new LiteralRef(value).build());
        }
      }
      rowStatements.push(`(${rowValues.join(", ")})`);
    }
    statements.push(rowStatements.join(", "));

    return statements.join("");
  }
}
