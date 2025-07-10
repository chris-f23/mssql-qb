import { Ref, ValueRef } from "./ref";

export class Fn {
  /**
   * @param  {...Ref|string} params
   * @returns
   */
  static CONCAT(...params) {
    return new Ref(
      `CONCAT(${params
        .map((param) => {
          if (typeof param === "string") {
            return new ValueRef(param).build();
          }

          return param.build();
        })
        .join(", ")})`
    );
  }

  /**
   * @param {DatePart} datePart
   * @param {Ref} startDate
   * @param {Ref} endDate
   */
  static DATEDIFF(datePart, startDate, endDate) {
    return new Ref(
      `DATEDIFF(${datePart}, ${startDate.build()}, ${endDate.build()})`
    );
  }

  static GETDATE() {
    return new Ref("GETDATE()");
  }

  /**
   * @param {Ref|string} str
   */
  static UPPER(str) {
    if (typeof str === "string") return new Ref(`UPPER('${str}')`);
    return new Ref(`UPPER(${str.build()})`);
  }
}
