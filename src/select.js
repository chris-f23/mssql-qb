import { TableDefinition } from "./table-definition";
import { ColumnRef, Ref } from "./ref";

/**
 * @template {Record<string, TableDefinition>} Source
 */
export class SelectBuilder {
  /** @type {SelectBuilderOptions} */
  #options;

  /** @type {null | Array<Ref>} */
  #selection = null;

  /** @type {null | { value: number, mode: SelectTopMode | undefined }} */
  #top = null;

  /** @type {null | true } */
  #distinct = null;

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
   * @param {SelectBuilderOptions} options
   */
  constructor(source, options = {}) {
    this.#options = {
      useDatabaseName: true,
      useSchemaName: true,
      useTableAlias: true,

      ...options,
    };

    const _options = this.#options;

    this.source = source;

    // @ts-ignore
    this.sourceTables = Object.fromEntries(
      Object.entries(this.source).map(([alias]) => {
        return [
          alias,
          {
            get(column) {
              if (column === "*") {
                return new Ref(
                  new ColumnRef(
                    _options.useTableAlias ? alias : null,
                    "*"
                  ).build()
                );
              }

              return new ColumnRef(
                _options.useTableAlias ? alias : null,
                column
              );
            },
          },
        ];
      })
    );
  }

  /**
   * @param {SelectCallback<Source>} selectCallback
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

  distinct() {
    this.#distinct = true;
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
   * @param {JoinCallback<Source>} joinCallback
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
   * @param {WhereCallback<Source>} whereCallback
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

    let topOption = "";
    if (this.#top) {
      topOption = `TOP (${this.#top.value}) ${
        this.#top.mode ? this.#top.mode + " " : ""
      }`;
    }

    let distinctOption = "";
    if (this.#distinct === true) {
      distinctOption = "DISTINCT ";
    }

    const selectStatement = `SELECT ${distinctOption}${topOption}${this.#selection
      .map((ref) => ref.build())
      .join(", ")}`;
    statements.push(selectStatement);

    if (this.#mainTable) {
      const mainTable = this.source[this.#mainTable];

      let builtTable = mainTable.build({
        useDatabaseName: this.#options.useDatabaseName ?? true,
        useSchemaName: this.#options.useSchemaName ?? true,
      });

      if (this.#options.useTableAlias === true) {
        builtTable += ` AS ${this.#mainTable.toString()}`;
      }

      statements.push(`FROM ${builtTable}`);
    }

    if (this.#joins) {
      const joinStatements = this.#joins
        .map((join) => {
          const secondaryTable = this.source[join.secondaryTable];

          let builtTable = secondaryTable.build({
            useDatabaseName: this.#options.useDatabaseName ?? true,
            useSchemaName: this.#options.useSchemaName ?? true,
          });

          if (this.#options.useTableAlias === true) {
            builtTable += ` AS ${join.secondaryTable.toString()}`;
          }

          return `JOIN ${builtTable} ON ${join.searchCondition.build()}`;
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
