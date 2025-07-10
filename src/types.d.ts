type SourceTables<TSource> = {
  // [TSourceTableAlias in keyof TSource]: TSource[TSourceTableAlias]["columns"];
  [TSourceTableAlias in keyof TSource]: {
    [TColumnAlias in keyof TSource[TSourceTableAlias]["columns"]]: import("./ref").ColumnRef;
  };
};

type SeachCondition =
  | import("./search-condition").Comparison
  | import("./search-condition").Condition;

type ComparisonOperator = "=" | ">" | "<" | ">=" | "<=" | "!=";
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
