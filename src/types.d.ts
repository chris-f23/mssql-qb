type SourceTables<TSource> = {
  // [TSourceTableAlias in keyof TSource]: TSource[TSourceTableAlias]["columns"];
  [TSourceTableAlias in keyof TSource]: {
    [TColumnAlias in keyof TSource[TSourceTableAlias]["columns"]]: import("./ref").ColumnRef;
  } & {
    "*": import("./ref").Ref;
  };
};
type SelectBuilderOptions = {
  useDatabaseName?: boolean;
  useSchemaName?: boolean;
  useTableAlias?: boolean;
} 
type SelectTopMode = "PERCENT" | "WITH TIES"

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
