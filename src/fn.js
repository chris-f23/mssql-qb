import { Ref } from "./ref";

export class Fn {
  /**
   * @param  {...Ref|string} params
   * @returns
   */
  static CONCAT(...params) {
    return new Ref(
      params
        .map((param) => {
          if (typeof param === "string") {
            return param;
          } else {
            return param.value;
          }
        })
        .join(" + ")
    );
  }

  /**
   * @param {DatePart} datePart
   * @param {Ref} startDate
   * @param {Ref} endDate
   */
  static DATEDIFF(datePart, startDate, endDate) {
    return new Ref(`DATEDIFF(${datePart}, ${startDate}, ${endDate})`);
  }

  static GETDATE() {
    return new Ref("GETDATE()");
  }

  static UPPER(str) {
    return new Ref(`UPPER(${str})`);
  }
}
