// type ColumnType = "text" | "numeric" | "boolean" | "date";

type SelectorTables<TSource> = {
  // [TSourceTableAlias in keyof TSource]: TSource[TSourceTableAlias]["columns"];
  [TSourceTableAlias in keyof TSource]: {
    [TColumnAlias in keyof TSource[TSourceTableAlias]["columns"]]: import("./ref").ColumnRef;
  };
};

type Selector<TSource> = (
  tables: SelectorTables<TSource>
) => Record<string, Column | import("./ref").Ref>;

type ComparisonOperator = "=" | ">" | "<" | ">=" | "<=" | "!=";

type Predicate<TSource> = (
  tables: SelectorTables<TSource>,
  joiner: Joiner
) => void;

type TMappedSource<TSource> = {
  [TSourceTableAlias in keyof TSource]: TSource[TSourceTableAlias]["columns"];
};

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
