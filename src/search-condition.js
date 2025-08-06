import { Ref, SubqueryRef } from "./ref";

export class Comparison {
  /** @private */
  leftRef;

  /** @private */
  operator;

  /** @private */
  rightRef;

  /**
   * @param {Ref} leftRef
   * @param {ComparisonOperator} operator
   * @param {Ref} rightRef
   */
  constructor(leftRef, operator, rightRef) {
    this.leftRef = leftRef;
    this.operator = operator;
    this.rightRef = rightRef;
  }

  build() {
    return `${this.leftRef.build()} ${this.operator} ${this.rightRef.build()}`;
  }

  /**
   * @param {Comparison|Condition} otherComparisonOrCondition
   */
  $and(otherComparisonOrCondition) {
    return new Condition(this, "AND", otherComparisonOrCondition);
  }

  /**
   * @param {Comparison|Condition} otherComparisonOrCondition
   */
  $or(otherComparisonOrCondition) {
    return new Condition(this, "OR", otherComparisonOrCondition);
  }
}

export class Condition {
  /** @private */
  leftRef;

  /** @private */
  operator;

  /** @private */
  rightRef;

  /**
   * @param {Comparison|Condition} leftComparisonOrCondition
   * @param {LogicalOperator} operator
   * @param {Comparison|Condition} rightComparisonOrCondition
   */
  constructor(leftComparisonOrCondition, operator, rightComparisonOrCondition) {
    this.leftRef = leftComparisonOrCondition;
    this.operator = operator;
    this.rightRef = rightComparisonOrCondition;
  }

  build() {
    return `${this.leftRef.build()} ${this.operator} ${this.rightRef.build()}`;
  }
}

export class Logical {
  /** @private @type {string} */
  expression;

  /**
   * @param {string} expression
   */
  constructor(expression) {
    this.expression = expression;
  }

  /**
   * TRUE if a subquery contains any rows.
   * @param {SubqueryRef} subquery
   */
  static exists(subquery) {
    return new Logical(`EXISTS ${subquery.build()}`);
  }

  /**
   * TRUE if both Boolean expressions are TRUE.
   * @param {Comparison|Logical} leftComparison
   * @param {Comparison|Logical} rightComparison
   */
  static and(leftComparison, rightComparison) {
    return new Logical(
      `${leftComparison.build()} AND ${rightComparison.build()}`
    );
  }

  /**
   * TRUE if the operand is equal to one of a list of expressions.
   * @param {Ref} leftRef
   * @param {SubqueryRef | Array<Ref>} subqueryOrRefs
   */
  static in(leftRef, subqueryOrRefs) {
    if (subqueryOrRefs instanceof SubqueryRef) {
      return new Logical(`${leftRef.build()} IN ${subqueryOrRefs.build()}`);
    }
    return new Logical(
      `${leftRef.build()} IN (${subqueryOrRefs
        .map((ref) => ref.build())
        .join(", ")})`
    );
  }

  /**
   * TRUE if the operand matches a pattern.
   * @param {Ref} matchExpression
   * @param {string} pattern
   * @param {string} [escapeCharacter]
   */
  static like(matchExpression, pattern, escapeCharacter) {
    if (escapeCharacter !== undefined) {
      return new Logical(
        `${matchExpression.build()} LIKE '${pattern}' ESCAPE '${escapeCharacter}'`
      );
    }

    return new Logical(`${matchExpression.build()} LIKE '${pattern}'`);
  }

  build() {
    return this.expression;
  }
}
