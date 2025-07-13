import { Ref } from "./ref";

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
