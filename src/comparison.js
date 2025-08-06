import { Ref } from "./ref";
import { Logical } from "./logical";

export class Comparison {
  /** @private @type {string} */
  leftExpression;

  /** @private @type {ComparisonOperator} */
  operator;

  /** @private @type {string} */
  rightExpression;

  /**
   * @param {Ref} leftExpression
   * @param {ComparisonOperator} operator
   * @param {Ref} rightExpression
   */
  constructor(leftExpression, operator, rightExpression) {
    this.leftExpression = leftExpression.build();
    this.operator = operator;
    this.rightExpression = rightExpression.build();
  }

  build() {
    return `${this.leftExpression} ${this.operator} ${this.rightExpression}`;
  }

  /**
   * @param {Comparison|Logical} otherComparisonOrCondition
   */
  $and(otherComparisonOrCondition) {
    return Logical.and(this, otherComparisonOrCondition);
  }

  /**
   * @param {Comparison|Logical} otherComparisonOrCondition
   */
  $or(otherComparisonOrCondition) {
    return Logical.or(this, otherComparisonOrCondition);
  }
}
