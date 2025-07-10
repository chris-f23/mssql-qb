import { Column, TableDefinition } from "./table-definition";
import { Ref } from "./ref";

/**
 * @template {Record<string, TableDefinition>} Source
 */
export class SelectBuilder {
  /** @type {Record<string, Column>} */
  selection = {};

  /** @type {Source} */
  source;

  /**
   * @param {Source} source
   */
  constructor(source) {
    this.source = source;
  }

  /**
   * @param {(source: SourceTables<Source>) => Array<Ref>} selectCallback
   */
  select(selectCallback) {
    return this;
  }

  /**
   * @param {keyof Source} mainTable
   */
  from(mainTable) {
    return this;
  }

  /**
   * @param {keyof Source} otherTable
   * @param {(source: SourceTables<Source>) => SeachCondition} joinCallback
   */
  join(otherTable, joinCallback) {
    return this;
  }

  /**
   * @param {(source: SourceTables<Source>) => SeachCondition} whereCallback
   */
  where(whereCallback) {
    return this;
  }

  build() {
    return "WIP";
  }
}
