import { ColumnRef, LiteralRef, Ref, ValueRef } from "./ref";
import { TableDefinition } from "./table-definition";

/**
 * @template {TableDefinition} Target
 * @template {Target["columns"][number]} TargetColumn
 */
export class UpdateBuilder {
  /**
   * @type {Array<TargetColumn>}
   */
  columns = [];

  /**
   * @readonly
   * @type {UpdateBuilderOptions}
   */
  options;

  /**
   * @type {{ column: TargetColumn, value: ValueRef }[]}
   */
  assignments = [];

  /** @type {TUpdateSource<Target>} */
  targetSource;

  /**
   * @param {Target} target
   * @param {Partial<UpdateBuilderOptions>} [options]
   */
  constructor(target, options = {}) {
    this.target = target;

    this.options = {
      useDatabaseName: true,
      useSchemaName: true,
      ...options,
    };

    /**
     *
     * @param {TargetColumn} column
     * @param {TValue} value
     */
    const assignValueToColumn = (column, value) => {
      if (!(value instanceof Ref)) {
        this.assignments.push({
          column,
          value: new LiteralRef(value),
        });
        return;
      }
      this.assignments.push({ column, value });
    };

    this.targetSource = {
      /**
       *
       * @param {TargetColumn} column
       * @returns {ColumnRef}
       */
      get(column) {
        return new ColumnRef(null, column);
      },
      /**
       *
       * @param {TargetColumn} column
       * @param {TValue} value
       */
      set(column, value) {
        assignValueToColumn(column, value);
      },
    };

    console.log(JSON.stringify(this.targetSource, null, 2));
  }

  /**
   * @param {UpdateCallback<Target>} setCallback
   */
  update(setCallback) {
    setCallback(this.targetSource);
    return this;
  }

  build() {
    const statements = [];

    statements.push(`UPDATE ${this.target.build(this.options)} SET `);

    statements.push(
      this.assignments
        .map(
          (assignment) => `${assignment.column} = ${assignment.value.build()}`
        )
        .join(", ")
    );

    return statements.join("");
  }
}
