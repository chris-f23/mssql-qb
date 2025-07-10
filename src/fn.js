import { Ref } from "./ref";

export class Fn {
  /**
   * @param  {...Ref|string} params
   * @returns
   */
  static concat(...params) {
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
  static datediff(datePart, startDate, endDate) {
    return new Ref(`DATEDIFF(${datePart}, ${startDate}, ${endDate})`);
  }

  static getdate() {
    return new Ref("GETDATE()");
  }
}
