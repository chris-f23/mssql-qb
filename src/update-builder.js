import { ColumnRef, LiteralRef, Ref, ValueRef } from "./ref";
import { Comparison } from "./search-condition";
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

  /** @type {null | { value: number, mode: SelectTopMode | undefined }} */
  #top = null;

  /**
   * @type {{ column: TargetColumn, value: ValueRef }[]}
   */
  assignments = [];

  /** @type {TUpdateSource<Target>} */
  targetSource;

  /** @type {null | SeachCondition} */
  #searchCondition = null;

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
  }

  /**
   * @param {SingleTableUpdateCallback<Target>} setCallback
   */
  update(setCallback) {
    setCallback(this.targetSource);
    return this;
  }

  /**
   * @param {number} value
   * @param {SelectTopMode} [mode]
   */
  top(value, mode) {
    this.#top = {
      value: value,
      mode: mode,
    };
    return this;
  }

  /**
   * @param {SingleTableWhereCallback<Target>} whereCallback
   */
  where(whereCallback) {
    if (this.#searchCondition !== null) {
      throw new Error("La función 'where' ya fue llamada previamente");
    }

    /** @type {Parameters<typeof whereCallback>[0]} */
    const whereCallbackParams = {
      compare: (column, comp, value) => {
        const _value = value instanceof Ref ? value : new LiteralRef(value);
        return new Comparison(new ColumnRef(null, column), comp, _value);
      },
    };

    this.#searchCondition = whereCallback(whereCallbackParams);

    return this;
  }

  build() {
    const statements = [];

    let topOption = "";
    if (this.#top) {
      topOption = `TOP (${this.#top.value}) ${
        this.#top.mode ? this.#top.mode + " " : ""
      }`;
    }

    statements.push(
      `UPDATE ${topOption}${this.target.build(this.options)} SET`
    );

    statements.push(
      this.assignments
        .map(
          (assignment) => `${assignment.column} = ${assignment.value.build()}`
        )
        .join(", ")
    );

    if (this.#searchCondition) {
      const whereStatement = `WHERE ${this.#searchCondition.build()}`;
      statements.push(whereStatement);
    }

    return statements.join(" ");
  }
}
