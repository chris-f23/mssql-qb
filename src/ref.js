import { Comparison } from "./search-condition";

export class Ref {
  /** @private @type {string} */
  value;

  /**
   * @param {string} value
   */
  constructor(value) {
    this.value = value;
  }

  /**
   * @param {string} alias 
   */
  as(alias) {
    return new Ref(`${this.value} AS ${alias}`);
  }

  build() {
    return this.value;
  }

  /**
   * @param {Ref} otherRef
   */
  $isEqualTo(otherRef) {
    return new Comparison(this, "=", otherRef);
  }

  /**
   * @param {Ref} otherRef
   */
  $isGreaterThan(otherRef) {
    return new Comparison(this, ">", otherRef);
  }

  /**
   * @param {Ref} otherRef
   */
  $isLessThan(otherRef) {
    return new Comparison(this, "<", otherRef);
  }
}

export class ColumnRef extends Ref {
  tableAlias;
  columnName;

  constructor(tableAlias, columnName) {
    super(`${tableAlias}.${columnName}`);
    this.tableAlias = tableAlias;
    this.columnName = columnName;
  }

  // /**
  //  * @param {Ref} otherRef
  //  */
  // equals(otherRef) {
  //   return new ComparisonRef(this, "=", otherRef);
  // }
}

export class ValueRef extends Ref {
  /**
   * @param {string|number|boolean|null} value
   */
  constructor(value) {
    let convertedValue;

    if (value === null) {
      convertedValue = "NULL";
    } else if (typeof value === "string") {
      convertedValue = `'${value}'`;
    } else if (typeof value === "number") {
      convertedValue = value.toString();
    } else if (typeof value === "boolean") {
      convertedValue = (value ? 1 : 0).toString();
    } else {
      throw new Error(`Tipo de dato no soportado: ${typeof value}`);
    }

    super(convertedValue);
  }
}
