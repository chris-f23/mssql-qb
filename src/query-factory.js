import { SelectBuilder } from "./builders/select-builder";
import { TableDefinition } from "./table-definition";

/**
 * @template {Record<string, TableDefinition>} TSource
 */
export class QueryFactory {
  /**
   * @param {TSource} source
   */
  constructor(source) {
    this.source = source;
  }

  /**
   * @param {Partial<QueryBuilderOptions>} [options]
   */
  createSelectQuery(options) {
    return new SelectBuilder(this.source, options);
  }

  /**
   *
   * @param {Partial<QueryBuilderOptions>} options
   * @param {(helper: SelectBuilder) => void} callback
   * @returns
   */
  createInlineSelectQuery(options, callback) {
    const helper = new SelectBuilder(this.source, options);
    callback(helper);
    return helper.build();
  }
}
