import { LiteralRef, Ref } from "./ref";
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
   * @param {TValue} rightExpression
   */
  constructor(leftExpression, operator, rightExpression) {
    this.leftExpression = leftExpression.build();
    this.operator = operator;

    if (rightExpression instanceof Ref) {
      this.rightExpression = rightExpression.build();
    } else {
      this.rightExpression = new LiteralRef(rightExpression).build();
    }
  }

  build() {
    return `${this.leftExpression} ${this.operator} ${this.rightExpression}`;
  }

  /**
   * @param {(Comparison|Logical)[]} comparisons
   */
  and(...comparisons) {
    return Logical.and(this, ...comparisons);
  }

  /**
   * @param {(Comparison|Logical)[]} comparisons
   */
  or(...comparisons) {
    return Logical.or(this, ...comparisons);
  }
}
