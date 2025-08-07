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
   * @param {Object} params
   * @param {Ref} params.matchExpression
   * @param {string} params.pattern
   * @param {string} [params.escapeCharacter]
   * @param {boolean} [params.not]
   */
  static like({ matchExpression, pattern, escapeCharacter, not }) {
    return new Logical(
      `${matchExpression.build()} ${not ? "NOT " : ""}LIKE '${pattern}'${
        escapeCharacter !== undefined ? ` ESCAPE '${escapeCharacter}'` : ""
      }`
    );
  }

  build() {
    return this.expression;
  }
}
