import { Ref } from "./ref";

export class Comparison {
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
}

export class Condition {
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
}
