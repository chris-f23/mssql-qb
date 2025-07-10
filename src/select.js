import { Column, TableDefinition } from "./table-definition";
import { ColumnRef, Ref } from "./ref";

/**
 * @template {Record<string, TableDefinition>} Source
 */
export class SelectBuilder {
  /** @type {null | Array<Ref>} */
  #selection = null;

  /** @type {null | keyof Source} */
  #mainTable = null;

  /** @type {null | Array<{ secondaryTable: keyof Source; searchCondition: SeachCondition }>} */
  #joins = null;

  /** @type {null | SeachCondition} */
  #searchCondition = null;

  /** @type {Source} */
  source;

  /** @type {SourceTables<Source>} */
  sourceTables;

  /**
   * @param {Source} source
   */
  constructor(source) {
    this.source = source;

    // @ts-ignore
    this.sourceTables = Object.fromEntries(
      Object.entries(this.source).map(([alias, tableDefinition]) => {
        return [
          alias,
          Object.fromEntries(
            Object.entries(tableDefinition.columns).map(
              ([columnKey, column]) => {
                return [columnKey, new ColumnRef(alias, column.name)];
              }
            )
          ),
        ];
      })
    );
  }

  /**
   * @param {(source: SourceTables<Source>) => Array<Ref>} selectCallback
   */
  select(selectCallback) {
    if (this.#selection !== null) {
      throw new Error("La función ya fue llamada previamente");
    }

    const selection = selectCallback(this.sourceTables);

    if (selection.length === 0) {
      throw new Error("No se seleccionaron columnas");
    }

    this.#selection = selection;
    return this;
  }

  /**
   * @param {keyof Source} mainTable
   */
  from(mainTable) {
    if (this.#selection === null) {
      throw new Error(
        "No es posible realizar 'from' sin una selección. Utilice la función 'select' primero."
      );
    }
    if (this.#mainTable !== null) {
      throw new Error("La función ya fue llamada previamente");
    }

    this.#mainTable = mainTable;
    return this;
  }

  /**
   * @param {keyof Source} secondaryTable
   * @param {(source: SourceTables<Source>) => SeachCondition} joinCallback
   */
  join(secondaryTable, joinCallback) {
    if (this.#mainTable === null) {
      throw new Error(
        "No es posible realizar 'join' sin una tabla principal. Utilice la función 'from' primero."
      );
    }
    if (this.#joins === null) {
      this.#joins = [];
    }

    const searchCondition = joinCallback(this.sourceTables);

    this.#joins.push({ secondaryTable, searchCondition });
    return this;
  }

  /**
   * @param {(source: SourceTables<Source>) => SeachCondition} whereCallback
   */
  where(whereCallback) {
    if (this.#mainTable === null) {
      throw new Error(
        "No es posible realizar 'where' sin una tabla principal. Utilice la función 'from' primero."
      );
    }
    if (this.#searchCondition !== null) {
      throw new Error("La función 'where' ya fue llamada previamente");
    }

    const searchCondition = whereCallback(this.sourceTables);
    this.#searchCondition = searchCondition;

    return this;
  }

  build() {
    if (this.#selection === null) {
      throw new Error("No se seleccionaron columnas");
    }
    const statements = [];

    const selectStatement = `SELECT ${this.#selection
      .map((ref) => ref.build())
      .join(", ")}`;
    statements.push(selectStatement);

    if (this.#mainTable) {
      const mainTable = this.source[this.#mainTable];

      const fromStatement = `FROM ${mainTable.build()} AS ${this.#mainTable.toString()}`;
      statements.push(fromStatement);
    }

    if (this.#joins) {
      const joinStatements = this.#joins
        .map((join) => {
          const secondaryTable = this.source[join.secondaryTable];

          return `JOIN ${secondaryTable.build()} AS ${join.secondaryTable.toString()} ON ${join.searchCondition.build()}`;
        })
        .join(" ");
      statements.push(joinStatements);
    }

    if (this.#searchCondition) {
      const whereStatement = `WHERE ${this.#searchCondition.build()}`;
      statements.push(whereStatement);
    }

    return statements.join(" ");
  }
}
