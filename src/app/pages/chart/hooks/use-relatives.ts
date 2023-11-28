import { IRelative, selectRelatives, useCustomSelector } from '../../../store'
import { RELATIONSHIPS_MAP } from '../models/constants';
import { IRelativeNode } from '../models/interfaces'
import { RelativeForSearch } from '../models/types';

export const useRelatives: () => {
  findRelativeByKey: (key: number) => IRelative,
  getRelativesWithRelationships: (selectedKey: number | null) => IRelativeNode[],
  getRelativesForSearch: () => RelativeForSearch[]
} = () => {
  const { relatives } = useCustomSelector(selectRelatives);

  const findRelativeByKey: (key: number) => IRelative = (key: number) => {
    return relatives.find((item: IRelative) => item.key === key) as IRelative;
  }

  const findChildrenByKey: (key: number) => IRelative[] = (key: number) =>  {
    return relatives.filter((item: IRelative) => item.parents?.includes(key));
  }

  const buildLabel: (relative: IRelative) => string = (relative: IRelative) => {
    let result: string = relative.name;

    if (relative.lastName.length) {
      result += ` ${relative.lastName}`;
    }

    return result;
  }

  const findWifeKeysByKey: (key: number) => number[] | undefined = (key: number): number[] | undefined => {
    const children: IRelative[] = findChildrenByKey(key);
    const result: Set<number> = new Set<number>();

    children.forEach((child: IRelative) => {
      const motherId: number | undefined = child.parents?.find((parentId: number) => findRelativeByKey(parentId).gender === 'F' && parentId !== key);
      if (motherId) {
        result.add(motherId);
      }
    });

    return result.size ? Array.from(result) : undefined;
  }

  const findHusbandKeysByKey: (key: number) => number[] | undefined = (key: number): number[] | undefined => {
    const children: IRelative[] = findChildrenByKey(key);
    const result: Set<number> = new Set<number>();

    children.forEach((child: IRelative) => {
      const motherId: number | undefined = child.parents?.find((parentId: number) => findRelativeByKey(parentId).gender === 'M' && parentId !== key);
      if (motherId) {
        result.add(motherId);
      }
    });

    return result.size ? Array.from(result) : undefined;
  }

  const findParentKeysByKey: (key: number) => Pick<IRelativeNode, 'motherKey' | 'fatherKey'> = 
    (key: number): Pick<IRelativeNode, 'motherKey' | 'fatherKey'> => {
    const relative: IRelative = findRelativeByKey(key);

    if (!relative.parents) {
      return {
        motherKey: undefined,
        fatherKey: undefined
      };
    }

    const parents: IRelative[] = relative.parents.map((relativeKey: number) => findRelativeByKey(relativeKey));

    return {
      motherKey: parents.find((relative: IRelative) => relative.gender === 'F')?.key,
      fatherKey: parents.find((relative: IRelative) => relative.gender === 'M')?.key,
    }
  }

  const getRelationsMap: (key: number) => Map<number, string[]> = (key: number): Map<number, string[]> => {
    const initialNode: IRelative = findRelativeByKey(key);
    const result: Map<number, string[]> = new Map<number, string[]>();

    const processNode = (node: IRelative) => {
      const currentSequence: string[] = result.get(node.key) ?? [];

      if (node.parents) {
        const parentKeys: number[] = node.parents.filter(
          (parentKey: number) => !Array.from(result.keys()).includes(parentKey) && parentKey !== key
        );

        for (const parentKey of parentKeys) {
          const parent: IRelative = findRelativeByKey(parentKey);
          const newKeyArray: string[] = currentSequence.concat([`p${parent.gender}`]);
          result.set(parentKey, newKeyArray);
          processNode(parent);
        }
      }

      const children: IRelative[] = findChildrenByKey(node.key).filter(
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

  const getRelationshipBySequence: (sequence: string) => string | undefined = (sequence: string): string | undefined => {
    for (const [key, value] of RELATIONSHIPS_MAP) {
      if (key.test(sequence)) {
        return value;
      }
    }

    return undefined;
  }

  const getRelationshipForNode: (relationshipMap: Map<number, string[]>, key: number) => string = (relationshipMap: Map<number, string[]>, key: number) => {
    if (!relationshipMap.has(key)) {
      return 'Не найдено';
    }

    const sequence: string[] = <string[]>relationshipMap.get(key);
    const relationship: string | undefined = getRelationshipBySequence(sequence.join('-'));

    return relationship ?? '-';
  }

  const getRelativesWithRelationships: (selectedKey: number | null) => IRelativeNode[] = (selectedKey: number | null) => {
    let mapper: (relative: IRelative) => IRelativeNode;
    if (selectedKey) {
      const relationshipMap: Map<number, string[]> = getRelationsMap(selectedKey);
      mapper = (relative: IRelative) => ({
        ...relative,
        label: buildLabel(relative),
        ...findParentKeysByKey(relative.key),
        wifeKeys: findWifeKeysByKey(relative.key),
        husbandKeys: findHusbandKeysByKey(relative.key),
        relationship: relative.key === selectedKey ? 'Я' : getRelationshipForNode(relationshipMap, relative.key)
      });
    } else {
      mapper = (relative: IRelative) => ({
        ...relative,
        label: buildLabel(relative),
        ...findParentKeysByKey(relative.key),
        wifeKeys: findWifeKeysByKey(relative.key),
        husbandKeys: findHusbandKeysByKey(relative.key),
        relationship: undefined
      });
    }

    return relatives.map(mapper);
  }

  const getRelativesForSearch: () => RelativeForSearch[] = () => {
    return relatives.map((relative: IRelative) => ({
      key: relative.key,
      label: buildLabel(relative)
    }))
  } 

  return {
    findRelativeByKey,
    getRelativesWithRelationships,
    getRelativesForSearch
  }
}