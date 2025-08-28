import { ValueRef, LiteralRef, Ref } from "./ref";

export class Fn {
  /**
   * @param  {...ValueRef|string} params
   */
  static CONCAT(...params) {
    return new ValueRef(
      `CONCAT(${params
        .map((param) => {
          if (typeof param === "string") {
            return new LiteralRef(param).build();
          }

          return param.build();
        })
        .join(", ")})`
    );
  }

  /**
   * @param {object} options
   * @param {boolean} [options.distinct]
   * @param {Ref | "*"} options.expression
   */
  static COUNT({ distinct, expression }) {
    const distinctPart = distinct === true ? "DISTINCT " : "";
    const expressionPart =
      expression instanceof Ref ? expression.build() : expression;

    return new ValueRef(`COUNT(${distinctPart}${expressionPart})`);
  }

  /**
   * @param {ValueRef} ref
   */
  static AVG(ref) {
    return new ValueRef(`AVG(${ref.build()})`);
  }

  /**
   * @param {DatePart} datePart
   * @param {ValueRef} startDate
   * @param {ValueRef} endDate
   */
  static DATEDIFF(datePart, startDate, endDate) {
    return new ValueRef(
      `DATEDIFF(${datePart}, ${startDate.build()}, ${endDate.build()})`
    );
  }

  static GETDATE() {
    return new ValueRef("GETDATE()");
  }

  /**
   * @param {ValueRef|string} str
   */
  static UPPER(str) {
    if (typeof str === "string") return new ValueRef(`UPPER('${str}')`);
    return new ValueRef(`UPPER(${str.build()})`);
  }
}
