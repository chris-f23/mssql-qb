import { Fn } from "./fn";
import { AliasedRef, ColumnRef, Ref, SubqueryRef, ValueRef } from "./ref";
import { TableDefinition } from "./table-definition";

/**
 * @template {Record<string, TableDefinition>} TSource
 */
export class QueryBuilder {
  /**
   * @type {QueryBuilderSelectCallbackHelper<TSource>}
   */
  helper;

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
    this.helper = new QueryBuilderSelectCallbackHelper(
      this.source,
      this.options
    );
  }

  /**
   * @param {(helper: QueryBuilderSelectCallbackHelper<TSource>) => void} callback
   */
  select(callback) {
    callback(this.helper);
    return this;
  }

  build() {
    return this.helper.build();
  }
}

/**
 * @template {Record<string, TableDefinition>} TSource
 */
class QueryBuilderSelectCallbackHelper {
  /** @type {Array<Ref>} */
  selectedRefs = [];

  /** @type {boolean} */
  distinctFlag = false;

  /** @type {Array<{ ref: Ref; order?: "ASC" | "DESC" }>} */
  _orderByRefs = [];

  /** @type {Array<Ref>} */
  _groupByRefs = [];

  /** @type {null | { tableAlias: keyof TSource; options: Partial<QueryBuilderIntoTableOptions> }} */
  intoTable = null;

  /** @type {null | SearchCondition} */
  searchCondition = null;

  /** @type {null | SearchCondition} */
  havingSearchCondition = null;

  /** @type {Array<{ tableAlias: keyof TSource; searchCondition: SearchCondition }>} */
  joinedTables = [];

  /** @type {null | keyof TSource} */
  fromTableAlias = null;

  /** @type {QueryBuilderOptions} */
  options;

  /**
   * @param {TSource} source
   * @param {QueryBuilderOptions} options
   */
  constructor(source, options) {
    this.source = source;
    this.options = options;
  }

  /**
   * @template {keyof TSource} TTableAlias
   * @template {TSource[TTableAlias]["columns"][number]} TTableColumn
   * @param {TTableAlias & string} _tableAlias
   * @param {TTableColumn & string} tableColumn
   */
  getColumnRef(_tableAlias, tableColumn) {
    const tableAlias = this.options.useTableAlias ? _tableAlias : null;
    return new ColumnRef(tableAlias, tableColumn);
  }

  /**
   * @template {keyof TSource} TTableAlias
   * @param {TTableAlias & string} _tableAlias
   */
  getStarRef(_tableAlias) {
    const tableAlias = this.options.useTableAlias ? _tableAlias : null;
    return new ColumnRef(tableAlias, "*");
  }

  /**
   * @template {keyof TSource} TTableAlias
   * @template {TSource[TTableAlias]["columns"][number]} TTableColumn
   * @param {TTableAlias & string} _tableAlias
   * @param {TTableColumn & string} tableColumn
   * @param {string} [columnAlias]
   */
  selectColumn(_tableAlias, tableColumn, columnAlias) {
    const tableAlias = this.options.useTableAlias ? _tableAlias : null;
    const _ref = new ColumnRef(tableAlias, tableColumn);

    let ref = columnAlias ? new AliasedRef(_ref, columnAlias) : _ref;

    this.selectedRefs.push(ref);
    return ref;
  }

  /**
   * @param {ValueRef} _ref
   * @param {string} [columnAlias]
   */
  selectCalculatedRef(_ref, columnAlias) {
    const ref = columnAlias ? new AliasedRef(_ref, columnAlias) : _ref;
    this.selectedRefs.push(ref);
  }

  /**
   * @template {keyof TSource} TTableAlias
   * @param {TTableAlias & string} _tableAlias
   */
  selectAllColumns(_tableAlias) {
    const tableAlias = this.options.useTableAlias ? _tableAlias : null;
    this.selectedRefs.push(new ColumnRef(tableAlias, "*"));
  }

  distinct() {
    this.distinctFlag = true;
  }

  // /**
  //  * @template {keyof TSource} TTableAlias
  //  * @template {TSource[TTableAlias]["columns"][number]} TTableColumn
  //  * @param {TTableAlias & string} _tableAlias
  //  * @param {"*" | (TTableColumn & string)} _tableColumn
  //  */
  // selectCount(_tableAlias, _tableColumn, columnAlias) {
  //   return Fn.COUNT(this.getColumnRef(_tableAlias, _tableColumn)).as(
  //     columnAlias
  //   );
  // }

  /**
   * @template {keyof TSource} TTableAlias
   * @param {TTableAlias & string} tableAlias
   * @param {Partial<QueryBuilderIntoTableOptions>} options
   */
  into(tableAlias, options) {
    this.intoTable = {
      tableAlias,
      options,
    };
  }

  /**
   * @template {keyof TSource} TTableAlias
   * @param {TTableAlias & string} tableAlias
   */
  from(tableAlias) {
    this.fromTableAlias = tableAlias;
  }

  /**
   * @param {SearchCondition} searchCondition
   */
  where(searchCondition) {
    this.searchCondition = searchCondition;
  }

  /**
   * @param {(helper: QueryBuilderSelectCallbackHelper<TSource>) => void} callback
   * @returns {SubqueryRef}
   */
  createSubquery(callback) {
    const helper = new QueryBuilderSelectCallbackHelper(
      this.source,
      this.options
    );
    callback(helper);

    return new SubqueryRef(helper.build());
  }

  /**
   * @template {keyof TSource} TTableAlias
   * @param {TTableAlias & string} tableAlias
   * @param {SearchCondition} searchCondition
   */
  innerJoin(tableAlias, searchCondition) {
    this.joinedTables.push({
      tableAlias,
      searchCondition,
    });
  }

  /**
   * @template {keyof TSource} TTableAlias
   * @template {TSource[TTableAlias]["columns"][number]} TTableColumn
   * @param {TTableAlias & string} _tableAlias
   * @param {TTableColumn & string} tableColumn
   * @param {"ASC" | "DESC"} [order]
   */
  orderByColumn(_tableAlias, tableColumn, order) {
    const tableAlias = this.options.useTableAlias ? _tableAlias : null;
    this._orderByRefs.push({
      ref: new ColumnRef(tableAlias, tableColumn),
      order,
    });
  }

  /**
   * @param {ColumnRef|AliasedRef} ref
   * @param {"ASC" | "DESC"} [order]
   */
  orderByRef(ref, order) {
    this._orderByRefs.push({ ref, order });
  }

  /**
   * @template {keyof TSource} TTableAlias
   * @template {TSource[TTableAlias]["columns"][number]} TTableColumn
   * @param {TTableAlias & string} _tableAlias
   * @param {TTableColumn & string} tableColumn
   */
  groupByColumn(_tableAlias, tableColumn) {
    const tableAlias = this.options.useTableAlias ? _tableAlias : null;
    this._groupByRefs.push(new ColumnRef(tableAlias, tableColumn));
  }

  /**
   * @param {(ColumnRef|AliasedRef)[]} refs
   */
  groupByRef(...refs) {
    this._groupByRefs.push(...refs);
  }

  /**
   * @param {SearchCondition} searchCondition
   */
  having(searchCondition) {
    this.havingSearchCondition = searchCondition;
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

    if (this.distinctFlag) {
      queryParts.push("DISTINCT");
    }

    queryParts.push(
      this.selectedRefs
        .map((col) => {
          return col.build();
          // const alias = col.alias ? ` AS ${String(col.alias)}` : "";
          // return `${col.ref.build()}${alias}`;
        })
        .join(", ")
    );

    if (this.intoTable) {
      queryParts.push("INTO");

      const intoTableFullName = this.source[this.intoTable.tableAlias].build(
        this.intoTable.options
      );

      queryParts.push(intoTableFullName);
    }

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

    if (this.searchCondition) {
      queryParts.push("WHERE");
      queryParts.push(this.searchCondition.build());
    }

    if (this._groupByRefs.length > 0) {
      queryParts.push("GROUP BY");
      queryParts.push(this._groupByRefs.map((ref) => ref.build()).join(", "));
    }

    if (this.havingSearchCondition) {
      queryParts.push("HAVING");
      queryParts.push(this.havingSearchCondition.build());
    }

    if (this._orderByRefs.length > 0) {
      queryParts.push("ORDER BY");
      queryParts.push(
        this._orderByRefs
          .map(({ ref, order }) => {
            const left = ref instanceof AliasedRef ? ref.alias : ref.build();
            const _order = order ? ` ${order}` : "";

            return `${left}${_order}`;
          })
          .join(", ")
      );
    }

    return queryParts.join(" ");
  }
}
