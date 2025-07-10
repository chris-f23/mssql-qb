import { Column, TableDefinition } from "./table-definition";
import { Fn } from "./fn";

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
   * @param {Selector<Source>} selector
   */
  select(selector) {
    return this;
  }

  /**
   * @param {keyof Source} mainTable
   * @returns
   */
  from(mainTable) {
    return this;
  }

  /**
   * @param {keyof Source} otherTable
   * @param {Predicate<Source>} predicate
   */
  join(otherTable, predicate) {
    return this;
  }

  // /**
  //  * @template {string & keyof Source} TableAlias
  //  * @template {keyof Source[TableAlias]["columns"]} TableColumn
  //  * @param {TableAlias} tableAlias
  //  * @param {TableColumn[]} tableColumns
  //  */
  // select(tableAlias, tableColumns) {
  //   this.selection[tableAlias] = tableColumns;
  // }
}
