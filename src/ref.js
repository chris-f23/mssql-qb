export class Ref {
  /** @type {string} */
  value;

  /**
   * @param {string} value
   */
  constructor(value) {
    this.value = value;
  }
}

export class ColumnRef extends Ref {
  tableAlias;
  columnName;

  constructor(tableAlias, columnName) {
    super(`${tableAlias}.${columnName}`);
    this.tableAlias = tableAlias;
    this.columnName = columnName;
  }

  /**
   * @param {Ref} otherRef
   */
  equals(otherRef) {
    return new ComparisonRef(this, "=", otherRef);
  }
}

export class ComparisonRef extends Ref {
  /**
   * @param {Ref} leftRef
   * @param {ComparisonOperator} operator
   * @param {Ref} rightRef
   */
  constructor(leftRef, operator, rightRef) {
    super(`${leftRef.value} ${operator} ${rightRef.value}`);
  }

  /**
   * @param {ComparisonRef} otherComparison
   */
  and(otherComparison) {
    return new ConditionRef(this, "AND", otherComparison);
  }

  /**
   * @param {ComparisonRef} otherComparison
   */
  or(otherComparison) {
    return new ConditionRef(this, "OR", otherComparison);
  }
}

export class ConditionRef extends Ref {
  /**
   * @param {ComparisonRef} leftRef
   * @param {"AND" | "OR"} operator
   * @param {ComparisonRef} rightRef
   */
  constructor(leftRef, operator, rightRef) {
    super(`${leftRef.value} ${operator} ${rightRef.value}`);
  }
}

export class Joiner {
  constructor() {}

  /**
   * @param {Ref} leftRef
   * @param {ComparisonOperator} operator
   * @param {Ref} rightRef
   */
  on(leftRef, operator, rightRef) {
    return this;
  }
}
