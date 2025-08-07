import { SubqueryRef, Ref, LiteralRef } from "./ref";

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
    return this.#exists({ subquery });
  }

  /**
   * TRUE if a subquery does not contain any rows.
   * @param {SubqueryRef} subquery
   */
  static notExists(subquery) {
    return this.#exists({ subquery, not: true });
  }

  /**
   * TRUE if a subquery contains any rows.
   * @param {Object} params
   * @param {SubqueryRef} params.subquery
   * @param {boolean} [params.not]
   */
  static #exists({ subquery, not }) {
    return new Logical(`${not ? "NOT " : ""}EXISTS ${subquery.build()}`);
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

  // /**
  //  * TRUE if either Boolean expression is TRUE.
  //  * @param {BooleanExpression|Logical} leftComparison
  //  * @param {BooleanExpression|Logical} rightComparison
  //  * @param {boolean} [wrapInParens]
  //  */
  // static or(leftComparison, rightComparison, wrapInParens = false) {
  //   return new Logical(
  //     `${
  //       wrapInParens ? "(" : ""
  //     }${leftComparison.build()} OR ${rightComparison.build()}${
  //       wrapInParens ? ")" : ""
  //     }`
  //   );
  // }

  /**
   * @param {(BooleanExpression|Logical)[]} comparisons
   * @returns
   */
  static or(...comparisons) {
    return new Logical(
      `${comparisons.map((comparison) => comparison.build()).join(" OR ")}`
    );
  }

  /**
   * TRUE if the operand is equal to one of a list of expressions.
   * @param {Object} params
   * @param {Ref} params.testExpression
   * @param {SubqueryRef | Array<TValue>} params.subqueryOrExpressionArray
   * @param {boolean} [params.not]
   */
  static #in({ testExpression, subqueryOrExpressionArray, not }) {
    if (subqueryOrExpressionArray instanceof SubqueryRef) {
      return new Logical(
        `${testExpression.build()} ${
          not ? "NOT " : ""
        }IN ${subqueryOrExpressionArray.build()}`
      );
    }
    return new Logical(
      `${testExpression.build()} ${
        not ? "NOT " : ""
      }IN (${subqueryOrExpressionArray
        .map((ref) => {
          if (ref instanceof Ref) return ref.build();
          return new LiteralRef(ref).build();
        })
        .join(", ")})`
    );
  }

  /**
   * TRUE if the operand is equal to one of a list of expressions.
   * @param {Ref} testExpression
   * @param {SubqueryRef | Array<TValue>} subqueryOrExpressionArray
   */
  static in(testExpression, subqueryOrExpressionArray) {
    return this.#in({
      testExpression,
      subqueryOrExpressionArray,
    });
  }

  /**
   * TRUE if the operand is not equal to one of a list of expressions.
   * @param {Ref} testExpression
   * @param {SubqueryRef | Array<TValue>} subqueryOrExpressionArray
   */
  static notIn(testExpression, subqueryOrExpressionArray) {
    return this.#in({
      testExpression,
      subqueryOrExpressionArray,
      not: true,
    });
  }
  /**
   * TRUE if the operand matches a pattern.
   * @param {Object} params
   * @param {Ref} params.matchExpression
   * @param {string} params.pattern
   * @param {string} [params.escapeCharacter]
   * @param {boolean} [params.not]
   */
  static #like({ matchExpression, pattern, escapeCharacter, not }) {
    return new Logical(
      `${matchExpression.build()} ${not ? "NOT " : ""}LIKE '${pattern}'${
        escapeCharacter !== undefined ? ` ESCAPE '${escapeCharacter}'` : ""
      }`
    );
  }

  /**
   * TRUE if the operand matches a pattern.
   * @param {Ref} matchExpression
   * @param {string} pattern
   * @param {string} [escapeCharacter]
   */
  static like(matchExpression, pattern, escapeCharacter) {
    return this.#like({ matchExpression, pattern, escapeCharacter });
  }

  /**
   * TRUE if the operand does not match a pattern.
   * @param {Ref} matchExpression
   * @param {string} pattern
   * @param {string} [escapeCharacter]
   */
  static notLike(matchExpression, pattern, escapeCharacter) {
    return this.#like({ matchExpression, pattern, escapeCharacter, not: true });
  }

  build() {
    return this.expression;
  }

  asGroup() {
    return new Logical(`(${this.build()})`);
  }

  /**
   * @param {(BooleanExpression|Logical)[]} comparisons
   * @returns
   */
  or(...comparisons) {
    return new Logical(
      `${this.build()} OR ${comparisons
        .map((comparison) => comparison.build())
        .join(" OR ")}`
    );
  }
}
