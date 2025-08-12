import { AliasedRef, CalculatedRef, ColumnRef, Ref, SubqueryRef } from "../ref";
import { TableDefinition } from "../table-definition";

/**
 * @template {Record<string, TableDefinition>} TSource
 */
export class SelectBuilder {
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
   * @template {keyof TSource} TTableAlias
   * @template {TSource[TTableAlias]["columns"][number]} TTableColumn
   * @param {TTableAlias & string} _tableAlias
   * @param {("*" | (TTableColumn & string))} tableColumn
   * @param {string} [columnAlias]
   */
  getColumnRef(_tableAlias, tableColumn, columnAlias) {
    const tableAlias = this.options.useTableAlias ? _tableAlias : null;
    return new ColumnRef(tableAlias, tableColumn, columnAlias);
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
    return this;
  }

  /**
   * @template {keyof TSource} TTableAlias
   * @template {"*" | TSource[TTableAlias]["columns"][number]} TTableColumn
   * @param {TTableAlias & string} _tableAlias
   * @param {TTableColumn[]} tableColumns
   * @returns
   */
  selectColumns(_tableAlias, tableColumns) {
    const tableAlias = this.options.useTableAlias ? _tableAlias : null;
    this.selectedRefs.push(
      ...tableColumns.map((col) => new ColumnRef(tableAlias, col))
    );
    return this;
  }

  /**
   * @param {CalculatedRef} _ref
   * @param {string} [columnAlias]
   */
  selectCalculatedRef(_ref, columnAlias) {
    const ref = columnAlias ? new AliasedRef(_ref, columnAlias) : _ref;
    this.selectedRefs.push(ref);
    return this;
  }

  /**
   * @param {ColumnRef} columnRef
   */
  selectColumnRef(columnRef) {
    this.selectedRefs.push(columnRef);
    return this;
  }

  /**
   * @template {keyof TSource} TTableAlias
   * @param {TTableAlias & string} _tableAlias
   */
  selectAllColumns(_tableAlias) {
    const tableAlias = this.options.useTableAlias ? _tableAlias : null;
    this.selectedRefs.push(new ColumnRef(tableAlias, "*"));
    return this;
  }

  distinct() {
    this.distinctFlag = true;
    return this;
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
    return this;
  }

  /**
   * @template {keyof TSource} TTableAlias
   * @param {TTableAlias & string} tableAlias
   */
  from(tableAlias) {
    this.fromTableAlias = tableAlias;
    return this;
  }

  /**
   * @param {SearchCondition} searchCondition
   */
  where(searchCondition) {
    this.searchCondition = searchCondition;
    return this;
  }

  /**
   * @param {(helper: SelectBuilder<TSource>) => void} callback
   * @returns {SubqueryRef}
   */
  createInlineSubqueryRef(callback) {
    const helper = new SelectBuilder(this.source, this.options);
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
    return this;
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
    return this;
  }

  /**
   * @param {ColumnRef|AliasedRef|CalculatedRef} ref
   * @param {"ASC" | "DESC"} [order]
   */
  orderByRef(ref, order) {
    this._orderByRefs.push({ ref, order });
    return this;
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
    return this;
  }

  /**
   * @param {(ColumnRef|AliasedRef|CalculatedRef)[]} refs
   */
  groupByRef(...refs) {
    this._groupByRefs.push(...refs);
    return this;
  }

  /**
   * @param {SearchCondition} searchCondition
   */
  having(searchCondition) {
    this.havingSearchCondition = searchCondition;
    return this;
  }

  // asSubquery() {
  //   return new SubqueryRef(this.build());
  // }

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
      queryParts.push(
        this._groupByRefs
          .map((ref) => {
            if (ref instanceof ColumnRef && ref.alias) {
              return ref.alias;
            }
            return ref.build();
          })
          .join(", ")
      );
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
            // const left = ref instanceof AliasedRef ? ref.alias : ref.build();
            const _order = order ? ` ${order}` : "";

            // return `${left}${_order}`;

            if (ref instanceof ColumnRef && ref.alias) {
              return `${ref.alias}${_order}`;
            }
            return `${ref.build()}${_order}`;
          })
          .join(", ")
      );
    }

    return queryParts.join(" ");
  }
}
