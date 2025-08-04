import { AliasedRef, ColumnRef, Ref } from "./ref";
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

  /** @type {Array<{ tableAlias: keyof TSource; searchCondition: SearchCondition }>} */
  joinedTables = [];

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
      selectColumn: (_tableAlias, tableColumn, columnAlias) => {
        const tableAlias = this.options.useTableAlias ? _tableAlias : null;
        const _ref = new ColumnRef(tableAlias, tableColumn);

        let ref = columnAlias ? new AliasedRef(_ref, columnAlias) : _ref;

        this.selectedRefs.push(ref);
        return ref;
      },
      selectCalculatedRef: (_ref, columnAlias) => {
        const ref = columnAlias ? new AliasedRef(_ref, columnAlias) : _ref;
        this.selectedRefs.push(ref);
      },
      selectAllColumns: (_tableAlias) => {
        const tableAlias = this.options.useTableAlias ? _tableAlias : null;
        this.selectedRefs.push(new ColumnRef(tableAlias, "*"));
      },
      from: (tableAlias) => {
        this.fromTableAlias = tableAlias;
      },
      innerJoin: (tableAlias, searchCondition) => {
        this.joinedTables.push({
          tableAlias,
          searchCondition,
        });
      },
      orderByColumn: (_tableAlias, tableColumn, order) => {
        const tableAlias = this.options.useTableAlias ? _tableAlias : null;
        this.orderByRefs.push({
          ref: new ColumnRef(tableAlias, tableColumn),
          order,
        });
      },

      orderByRef: (ref, order) => {
        this.orderByRefs.push({ ref, order });
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
    queryParts.push(
      this.selectedRefs
        .map((col) => {
          return col.build();
          // const alias = col.alias ? ` AS ${String(col.alias)}` : "";
          // return `${col.ref.build()}${alias}`;
        })
        .join(", ")
    );

    queryParts.push("FROM");
    const mainTable =
      this.source[this.fromTableAlias].build(this.options) +
      (this.options.useTableAlias ? ` AS ${String(this.fromTableAlias)}` : "");

    queryParts.push(mainTable);

    if (this.joinedTables.length > 0) {
      queryParts.push("INNER JOIN");
      queryParts.push(
        this.joinedTables
          .map(({ tableAlias, searchCondition }) => {
            const table = this.source[tableAlias];
            return (
              `${table.build(this.options)} AS ${String(tableAlias)}` +
              ` ON ${searchCondition.build()}`
            );
          })
          .join(" ")
      );
    }

    if (this.orderByRefs.length > 0) {
      queryParts.push("ORDER BY");
      queryParts.push(
        this.orderByRefs
          .map(({ ref, order }) => {
            if (ref instanceof AliasedRef) {
              return `${ref.alias} ${order}`;
            }
            return `${ref.build()} ${order}`;
          })
          .join(", ")
      );
    }

    return queryParts.join(" ");
  }
}
