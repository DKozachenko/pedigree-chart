import { IRelative, selectRelatives, useCustomSelector } from '../../../store';
import { RELATIONSHIPS_MAP } from '../models/constants/relationships-map';
import { IRelativeNode } from '../models/interfaces';

export class RelationshipService {
  private relativesState: IRelative[] = useCustomSelector(selectRelatives);
  private relationshipMap: Map<number, string[]> = new Map<number, string[]>();

  private findWifeKeysByKey(key: number): number[] | undefined {
    const children: IRelative[] = this.findChildrenByKey(key);
    const result: Set<number> = new Set<number>();

    children.forEach((child: IRelative) => {
      const motherId: number | undefined = child.parents?.find((parentId: number) => this.findRelativeByKey(parentId).gender === 'F' && parentId !== key);
      if (motherId) {
        result.add(motherId);
      }
    });

    return result.size ? Array.from(result) : undefined;
  }

  private findHusbandKeysByKey(key: number): number[] | undefined {
    const children: IRelative[] = this.findChildrenByKey(key);
    const result: Set<number> = new Set<number>();

    children.forEach((child: IRelative) => {
      const motherId: number | undefined = child.parents?.find((parentId: number) => this.findRelativeByKey(parentId).gender === 'M' && parentId !== key);
      if (motherId) {
        result.add(motherId);
      }
    });

    return result.size ? Array.from(result) : undefined;
  }

  private buildInitials(relative: IRelative): string {
    let result: string = `${relative.lastName} ${relative.name[0].toUpperCase()}.`;

    if (relative.middleName) {
      result += `${relative.middleName[0].toUpperCase()}.`;
    }

    return result;
  }

  private findParentKeysByKey(key: number): Pick<IRelativeNode, 'motherKey' | 'fatherKey'> {
    const relative: IRelative = this.findRelativeByKey(key);

    if (!relative.parents) {
      return {
        motherKey: undefined,
        fatherKey: undefined
      };
    }

    const parents: IRelative[] = relative.parents.map((relativeKey: number) => this.findRelativeByKey(relativeKey));

    return {
      motherKey: parents.find((relative: IRelative) => relative.gender === 'F')?.key,
      fatherKey: parents.find((relative: IRelative) => relative.gender === 'M')?.key,
    }
  }


  private getRelationsMap(key: number): Map<number, string[]> {
    const initialNode: IRelative = this.findRelativeByKey(key);
    const result: Map<number, string[]> = new Map<number, string[]>();

    const processNode = (node: IRelative) => {
      const currentSequence: string[] = result.get(node.key) ?? [];

      if (node.parents) {
        const parentKeys: number[] = node.parents.filter(
          (parentKey: number) => !Array.from(result.keys()).includes(parentKey) && parentKey !== key
        );

        for (const parentKey of parentKeys) {
          const parent: IRelative = this.findRelativeByKey(parentKey);
          const newKeyArray: string[] = currentSequence.concat([`p${parent.gender}`]);
          result.set(parentKey, newKeyArray);
          processNode(parent);
        }
      }

      const children: IRelative[] = this.findChildrenByKey(node.key).filter(
        (child: IRelative) => !Array.from(result.keys()).includes(child.key) && child.key !== key
      );

      for (const child of children) {
        const newChildArray: string[] = currentSequence.concat([`c${child.gender}`]);
        result.set(child.key, newChildArray);
        processNode(child);
      }
    }

    processNode(initialNode);

    return result;
  }

  private getRelationshipBySequence(sequence: string): string | undefined {
    for (const [key, value] of RELATIONSHIPS_MAP) {
      if (key.test(sequence)) {
        return value;
      }
    }

    return undefined;
  }

  private getRelationshipForNode(key: number): string {
    if (!this.relationshipMap.has(key)) {
      return 'Не найдено';
    }

    const sequence: string[] = <string[]>this.relationshipMap.get(key);
    const relationship: string | undefined = this.getRelationshipBySequence(sequence.join('-'));

    return relationship ?? '-';
  }

  findRelativeByKey(key: number): IRelative {
    return this.relativesState.find((item: IRelative) => item.key === key) as IRelative;
  }

  findChildrenByKey(key: number): IRelative[] {
    return this.relativesState.filter((item: IRelative) => item.parents?.includes(key));
  }

  getRelativesForDiagram(selectedKey: number | null): IRelativeNode[] {
    if (selectedKey) {
      this.relationshipMap = this.getRelationsMap(selectedKey);
      return this.relativesState.map((relative: IRelative) => ({
        ...relative,
        initials: this.buildInitials(relative),
        ...this.findParentKeysByKey(relative.key),
        wifeKeys: this.findWifeKeysByKey(relative.key),
        husbandKeys: this.findHusbandKeysByKey(relative.key),
        relationship: relative.key === selectedKey ? 'Я' : this.getRelationshipForNode(relative.key)
      }));
    }

    return this.relativesState.map((relative: IRelative) => ({
      ...relative,
      initials: this.buildInitials(relative),
      ...this.findParentKeysByKey(relative.key),
      wifeKeys: this.findWifeKeysByKey(relative.key),
      husbandKeys: this.findHusbandKeysByKey(relative.key),
      relationship: ''
    }));
  }

  getRelativesForSelect(): Pick<IRelativeNode, 'key' | 'initials'>[] {
    return this.relativesState.map((relative: IRelative) => ({
      key: relative.key,
      initials: this.buildInitials(relative)
    }))
  } 
}