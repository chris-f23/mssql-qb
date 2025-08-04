import { ColumnRef, Ref } from "./ref";
import { TableDefinition } from "./table-definition";

/**
 * @template {Record<string, TableDefinition>} TSource
 */
export class QueryBuilder {
  /** @type {TSource} */
  source;

  /** @type {null | keyof TSource} */
  fromTableAlias = null;

  /** @type {Array<Ref>} */
  selectedRefs = [];

  /** @type {Array<{ ref: Ref; order: "ASC" | "DESC" }>} */
  orderByRefs = [];

  /** @type {QueryBuilderOptions} */
  options;

  /**
   * @param {TSource} source
   * @param {Partial<QueryBuilderOptions>} [options]
   */
  constructor(source, options) {
    this.source = source;
    this.options = {
      useDatabaseName: true,
      useSchemaName: true,
      useTableAlias: true,
      ...options,
    };
  }

  /**
   *
   * @param {QueryBuilderSelectCallback<TSource>} callback
   */
  select(callback) {
    callback({
      getColumnRef: (_tableAlias, tableColumn) => {
        const tableAlias = this.options.useTableAlias ? _tableAlias : null;
        return new ColumnRef(tableAlias, tableColumn);
      },
      selectRef: (ref) => {
        this.selectedRefs.push(ref);
      },
      selectStar: (_tableAlias) => {
        const tableAlias = this.options.useTableAlias ? _tableAlias : null;
        this.selectedRefs.push(new ColumnRef(tableAlias, "*"));
      },
      from: (tableAlias) => {
        this.fromTableAlias = tableAlias;
      },
      orderBy: (_tableAlias, tableColumn, order) => {
        const tableAlias = this.options.useTableAlias ? _tableAlias : null;
        this.orderByRefs.push({
          ref: new ColumnRef(tableAlias, tableColumn),
          order,
        });
      },
      selectColumn: (_tableAlias, tableColumn, columnAlias) => {
        const tableAlias = this.options.useTableAlias ? _tableAlias : null;
        const ref = new ColumnRef(tableAlias, tableColumn);

        if (columnAlias) {
          this.selectedRefs.push(ref.as(columnAlias));
        } else {
          this.selectedRefs.push(ref);
        }
      },
    });

    return this;
  }

  build() {
    const queryParts = [];

    if (this.selectedRefs.length === 0) {
      throw new Error("No se seleccionaron columnas");
    }

    if (this.fromTableAlias === null) {
      throw new Error("No se seleccionaron tablas");
    }

    queryParts.push("SELECT");
    queryParts.push(this.selectedRefs.map((ref) => ref.build()).join(", "));

    queryParts.push("FROM");
    const mainTable =
      this.source[this.fromTableAlias].build(this.options) +
      (this.options.useTableAlias ? ` AS ${String(this.fromTableAlias)}` : "");

    queryParts.push(mainTable);

    if (this.orderByRefs.length > 0) {
      queryParts.push("ORDER BY");
      queryParts.push(
        this.orderByRefs
          .map((ref) => `${ref.ref.build()} ${ref.order}`)
          .join(", ")
      );
    }

    return queryParts.join(" ");
  }
}
