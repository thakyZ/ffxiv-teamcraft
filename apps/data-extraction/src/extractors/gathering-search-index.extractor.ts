import { AbstractExtractor } from '../abstract-extractor';
import { uniq } from 'lodash';


export class GatheringSearchIndexExtractor extends AbstractExtractor {

  protected doExtract(): void {
    const nodes = this.requireLazyFile('nodes');
    const fishing = this.requireLazyFile('fishing-spots');
    const reductions = this.requireLazyFile('reduction');

    const index: Record<number, { types?: number[], reduction?: boolean }> = {};

    Object.entries<any>(nodes).forEach(([id, node]) => {
      [...node.items, ...(node.hiddenItems || [])].forEach(itemId => {
        index[itemId] = {
          types: uniq([...(index[itemId]?.types || []), node.type])
        };
      });
    });

    Object.values<any>(fishing).forEach(node => {
      node.fishes.forEach(itemId => {
        index[itemId] = {
          types: [5]
        };
      });
    });

    Object.entries<any>(reductions).forEach(([sourceId, itemIds]) => {
      index[sourceId] = {
        ...(index[sourceId] || {}),
        reduction: true
      };
      itemIds.forEach(itemId => {
        index[itemId] = {
          ...(index[itemId] || {}),
          reduction: true
        };
      });
    });

    delete index[0];

    this.persistToJsonAsset('gathering-search-index', index);
    this.done();
  }

  getName(): string {
    return 'gathering-search-index';
  }

}
