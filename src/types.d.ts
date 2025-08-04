type SourceTables<TSource> = {
  // [TSourceTableAlias in keyof TSource]: TSource[TSourceTableAlias]["columns"];
  [TSourceTableAlias in keyof TSource]: {
    get<
      TColumnName extends "*" | TSource[TSourceTableAlias]["columns"][number]
    >(
      column: TColumnName
    ): TColumnName extends "*"
      ? import("./ref").Ref
      : import("./ref").ColumnRef;
  };

  // get<
  //   TTableName extends keyof TSource,
  //   TTableColumn extends TSource[TTableName]["columns"][number]
  // >(
  //   table: TTableName,
  //   column: TTableColumn
  // ): import("./ref").ColumnRef;
};

type RowToInsert<TargetTable extends TableDefinition> = Record<
  TargetTable["columns"][number],
  LiteralRef
>;

type RowToInsertPartialOrRequired<
  TRow extends RowToInsert,
  TOmitColumnListOption extends boolean
> = TOmitColumnListOption extends true ? TRow : Partial<TRow>;

type BuilderOptions = {
  useDatabaseName: boolean;
  useSchemaName: boolean;
};

type SelectBuilderOptions = BuilderOptions & {
  useTableAlias: boolean;
};

type InsertBuilderOptions = BuilderOptions & {};
type UpdateBuilderOptions = BuilderOptions & {};

type BuildTableOptions = {
  useDatabaseName: boolean;
  useSchemaName: boolean;
};

type SelectTopMode = "PERCENT"; // "WITH TIES"

type SearchCondition =
  | import("./search-condition").Comparison
  | import("./search-condition").Condition;

type SelectCallback<TSource> = (
  source: SourceTables<TSource>
) => Array<import("./ref").Ref>;

type JoinCallback<TSource> = (source: SourceTables<TSource>) => SearchCondition;

type WhereCallback<TSource> = (
  source: SourceTables<TSource>
) => SearchCondition;

type ComparisonOperator = "=" | ">" | "<" | ">=" | "<=" | "<>" | "LIKE";
type LogicalOperator = "AND" | "OR";

type DatePart =
  | "year"
  | "quarter"
  | "month"
  | "dayofyear"
  | "day"
  | "week"
  | "weekday"
  | "hour"
  | "minute"
  | "second"
  | "millisecond"
  | "microsecond"
  | "nanosecond";

type TValue = number | string | boolean | null | import("./ref").ValueRef;

type TUpdateSource<
  TTarget extends import("./table-definition").TableDefinition
> = {
  get(column: TTarget["columns"][number]): import("./ref").ColumnRef;
  set(column: TTarget["columns"][number], value: TValue): void;
};

// type UpdateCallback<TSource> = (
//   current: TUpdateSource<TSource>
// ) => Partial<Record<TSource["columns"][number], import("./ref").Ref>>;

type UpdateCallback<TSource> = (current: TUpdateSource<TSource>) => void;

type SingleTableColumnGetter<
  TTarget extends import("./table-definition").TableDefinition
> = {
  get: (column: TTarget["columns"][number]) => import("./ref").ColumnRef;
};

type AssignmentOperator = "=" | "+=" | "-=" | "*=" | "/=";

type SingleTableColumnSetter<
  TTarget extends import("./table-definition").TableDefinition
> = {
  set: (
    column: TTarget["columns"][number],
    operator: AssignmentOperator,
    value: TValue
  ) => void;
};

type SingleTableColumnGetterAndSetter<
  TTarget extends import("./table-definition").TableDefinition
> = SingleTableColumnGetter<TTarget> & SingleTableColumnSetter<TTarget>;

type SingleTableUpdateCallback<TTarget> = (
  target: SingleTableColumnGetterAndSetter<TTarget>
) => void;

type SingleTableColumnComparator<
  TTarget extends import("./table-definition").TableDefinition
> = {
  compare: (
    column: TTarget["columns"][number],
    comp: ComparisonOperator,
    value: TValue
  ) => import("./search-condition").Comparison;
};

type SingleTableWhereCallback<TTarget> = (
  target: SingleTableColumnComparator<TTarget>
) => SearchCondition;

type QueryBuilderSelectCallbackHelper<
  TSource extends Record<string, import("./table-definition").TableDefinition>
> = {
  /**
   * Obtiene una referencia a una columna de una tabla
   * @param tableAlias - El alias de la tabla
   * @param tableColumn - La columna de la tabla
   * @returns
   */
  getColumnRef: <
    TTableAlias extends keyof TSource,
    TTableColumn extends TSource[TTableAlias]["columns"][number]
  >(
    tableAlias: TTableAlias & string,
    tableColumn: TTableColumn & string
  ) => import("./ref").ColumnRef;

  selectCalculatedRef: (
    ref: import("./ref").ValueRef,
    columnAlias?: string
  ) => void;

  selectAllColumns: <TTableAlias extends keyof TSource>(
    tableAlias: TTableAlias & string
  ) => void;

  distinct: () => void;

  into: <TTableAlias extends keyof TSource>(
    tableAlias: TTableAlias & string,
    options: Partial<QueryBuilderIntoTableOptions>
  ) => void;

  selectColumn: <
    TTableAlias extends keyof TSource,
    TTableColumn extends TSource[TTableAlias]["columns"][number]
  >(
    tableAlias: TTableAlias & string,
    tableColumn: TTableColumn & string,
    columnAlias?: string
  ) => import("./ref").ColumnRef | import("./ref").AliasedRef;

  from: <TTableAlias extends keyof TSource>(
    tableAlias: TTableAlias & string
  ) => void;

  innerJoin: <TTableAlias extends keyof TSource>(
    tableAlias: TTableAlias & string,
    searchCondition: SearchCondition
  ) => void;

  where: (searchCondition: SearchCondition) => void;

  orderByColumn: <TTableAlias extends keyof TSource>(
    tableAlias: TTableAlias & string,
    tableColumn: TSource[TTableAlias]["columns"][number] & string,
    order?: "ASC" | "DESC"
  ) => void;

  orderByRef: (
    ref: import("./ref").ColumnRef | import("./ref").AliasedRef,
    order: "ASC" | "DESC"
  ) => void;
};

type QueryBuilderSelectCallback<TSource> = (
  helper: QueryBuilderSelectCallbackHelper<TSource>
) => void;

type QueryBuilderOptions = {
  useDatabaseName: boolean;
  useSchemaName: boolean;
  useTableAlias: boolean;
};

type QueryBuilderIntoTableOptions = {
  useDatabaseName: boolean;
  useSchemaName: boolean;
};
