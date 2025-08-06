import { SubqueryRef, Ref } from "./ref";

/**
 * @typedef {import("./comparison").Comparison} BooleanExpression
 */

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
   * @param {BooleanExpression|Logical} leftComparison
   * @param {BooleanExpression|Logical} rightComparison
   */
  static and(leftComparison, rightComparison) {
    return new Logical(
      `${leftComparison.build()} AND ${rightComparison.build()}`
    );
  }

  /**
   * TRUE if either Boolean expression is TRUE.
   * @param {BooleanExpression|Logical} leftComparison
   * @param {BooleanExpression|Logical} rightComparison
   */
  static or(leftComparison, rightComparison) {
    return new Logical(
      `${leftComparison.build()} OR ${rightComparison.build()}`
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
