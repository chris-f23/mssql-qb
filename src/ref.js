import { Comparison } from "./search-condition";

/**
 * Una referencia es cualquier valor que pueda ser utilizado en una consulta.
 * La referencia base solo tiene acceso al valor guardado.
 * @abstract
 */
export class Ref {
  /**
   * El valor de la referencia.
   * @protected @type {string}
   */
  value;

  /**
   * @param {string} value
   */
  constructor(value) {
    this.value = value;
  }

  /**
   * Construye la referencia, devolviendo el valor guardado.
   * @returns {string}
   */
  build() {
    return this.value;
  }
}

/**
 * Una referencia que puede ser utilizada en comparaciones.
 * Posee funciones para construir comparaciones con otras referencias comparables.
 * Además, permite asignar un alias a la referencia.
 */
export class ValueRef extends Ref {
  /**
   * Crea una referencia comparable a partir de un valor.
   * @param {string} value
   */
  constructor(value) {
    super(value);
  }

  /**
   * Asigna un alias a la referencia actual, generando una nueva referencia.
   * @param {string} alias
   */
  as(alias) {
    return new Ref(`${this.value} AS ${alias}`);
  }

  /**
   * Crea una comparación "=" entre la referencia actual y otra.
   * @param {TValue} otherValue
   */
  $isEqualTo(otherValue) {
    if (otherValue instanceof Ref) return new Comparison(this, "=", otherValue);
    return new Comparison(this, "=", new LiteralRef(otherValue));
  }

  /**
   * Crea una comparación ">" entre la referencia actual y otra.
   * @param {ValueRef} otherRef
   */
  $isGreaterThan(otherRef) {
    return new Comparison(this, ">", otherRef);
  }

  /**
   * Crea una comparación "<" entre la referencia actual y otra.
   * @param {ValueRef} otherRef
   */
  $isLessThan(otherRef) {
    return new Comparison(this, "<", otherRef);
  }

  /**
   * Crea una comparación ">=" entre la referencia actual y otra.
   * @param {ValueRef} otherRef
   */
  $isGreaterThanOrEqualTo(otherRef) {
    return new Comparison(this, ">=", otherRef);
  }

  /**
   * Crea una comparación "<=" entre la referencia actual y otra.
   * @param {ValueRef} otherRef
   */
  $isLessThanOrEqualTo(otherRef) {
    return new Comparison(this, "<=", otherRef);
  }

  /**
   * Crea una comparación "<>" entre la referencia actual y otra.
   * @param {ValueRef} otherRef
   */
  $isNotEqualTo(otherRef) {
    return new Comparison(this, "<>", otherRef);
  }

  /**
   * Crea una comparación LIKE entre la referencia actual y un patrón.
   * @param {string | LiteralRef} pattern
   * @param {string} [escapeChar]
   */
  $isLike(pattern, escapeChar) {
    const _pattern = pattern instanceof Ref ? pattern.build() : pattern;

    const rightRef =
      escapeChar !== undefined
        ? new Ref(`'${_pattern}' ESCAPE '${escapeChar}'`)
        : new Ref(`'${_pattern}'`);

    return new Comparison(this, "LIKE", rightRef);
  }

  /**
   * @param {TValue} otherValue
   * @returns {CalculatedRef}
   */
  $multiplyBy(otherValue) {
    const otherValueRef =
      otherValue instanceof Ref ? otherValue : new LiteralRef(otherValue);

    return new CalculatedRef(`${this.value} * ${otherValueRef.build()}`);
  }

  /**
   *
   * @param {TValue} otherValue
   * @returns {CalculatedRef}
   */
  $add(otherValue) {
    const otherValueRef =
      otherValue instanceof Ref ? otherValue : new LiteralRef(otherValue);

    return new CalculatedRef(`${this.value} + ${otherValueRef.build()}`);
  }
}

export class ColumnRef extends ValueRef {
  /**
   * Crea una referencia a una columna de una tabla.
   * @param {string|null} tableAlias - El alias de la tabla
   * @param {string} columnName - El nombre de la columna de la tabla
   */
  constructor(tableAlias, columnName) {
    if (tableAlias) {
      super(`${tableAlias}.${columnName}`);
    } else {
      super(columnName);
    }
  }
}

export class AliasedRef extends Ref {
  /**
   *
   * @param {ValueRef} ref - Referencia a la que se le asigna un alias
   * @param {string} alias - Alias de la referencia
   */
  constructor(ref, alias) {
    super(`${ref.build()} AS ${alias}`);
    this.alias = alias;
  }
}

export class CalculatedRef extends ValueRef {
  /**
   * @param {string} expression
   */
  constructor(expression) {
    super(`(${expression})`);
  }
}

/**
 * Una referencia a un valor literal.
 */
export class LiteralRef extends ValueRef {
  /**
   * Crea una referencia a un valor literal.
   * Dependiendo del tipo de dato recibido se construye el valor adecuado para la referencia.
   * @param {string|number|boolean|null} value
   * @param {boolean} isUnicodeString
   */
  constructor(value, isUnicodeString = false) {
    let convertedValue;

    if (value === null) {
      convertedValue = "NULL";
    } else if (typeof value === "string") {
      if (isUnicodeString === true) convertedValue = `N'${value}'`;
      else convertedValue = `'${value}'`;
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

export function N() {
  return new LiteralRef(arguments[0][0], true);
}

// export class TableRef {
//   /** @type {string|undefined} */
//   databaseName;

//   /** @type {string|undefined} */
//   schemaName;

//   /** @type {string} */
//   tableName;

//   /**
//    * @param {object} params
//    * @param {string} [params.databaseName]
//    * @param {string} [params.schemaName]
//    * @param {string} params.tableName
//    */
//   constructor({ databaseName, schemaName, tableName }) {
//     this.databaseName = databaseName;
//     this.schemaName = schemaName;
//     this.tableName = tableName;
//   }

//   /**
//    * @param {object} options
//    * @param {boolean} [options.useDatabaseName]
//    * @param {boolean} [options.useSchemaName]
//    * @returns {string}
//    */
//   build(options) {
//     let fullName = "";

//     if (options.useDatabaseName && this.databaseName) {
//       fullName += `${this.databaseName}.`;
//     }
//     if (options.useSchemaName && this.schemaName) {
//       fullName += `${this.schemaName}.`;
//     }

//     fullName += this.tableName;

//     return fullName;
//   }
// }

// export class TemporaryTableRef extends TableRef {
//   /**
//    * @param {ConstructorParameters<typeof TableRef>[0]} params
//    */
//   constructor({ databaseName, schemaName, tableName }) {
//     super({ databaseName, schemaName, tableName });
//   }
// }
