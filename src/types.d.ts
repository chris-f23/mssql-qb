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

type InsertBuilderOptions = BuilderOptions & {
  omitColumnList: boolean;
};

type BuildTableOptions = {
  useDatabaseName: boolean;
  useSchemaName: boolean;
};

type SelectTopMode = "PERCENT"; // "WITH TIES"

type SeachCondition =
  | import("./search-condition").Comparison
  | import("./search-condition").Condition;

type SelectCallback<TSource> = (
  source: SourceTables<TSource>
) => Array<import("./ref").Ref>;

type JoinCallback<TSource> = (source: SourceTables<TSource>) => SeachCondition;

type WhereCallback<TSource> = (source: SourceTables<TSource>) => SeachCondition;

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
