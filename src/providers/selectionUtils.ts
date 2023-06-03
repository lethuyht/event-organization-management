import {
  FieldNode,
  FragmentSpreadNode,
  GraphQLResolveInfo,
  ResponsePath,
  SelectionSetNode,
} from 'graphql';
import { flatMap } from 'lodash';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function instanceOfFieldNode(object: any): object is FieldNode {
  return 'kind' in object && object.kind === 'Field';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function instanceOfFragmentSpreadNode(
  object: any,
): object is FragmentSpreadNode {
  return 'kind' in object && object.kind === 'FragmentSpread';
}

/**
 * Resolve a field name and account for aliases
 */
const getQueriedName = (field: FieldNode) =>
  field.alias ? field.alias.value : field.name.value;

/**
 * Retrieve the query path
 * @param path the info path
 * @param agg
 */
const getPath = (path: ResponsePath, agg: string[] = []): string[] => {
  if (typeof path.key !== 'string') {
    throw new Error(`Unhandled non string key in graphql path: "${path.key}"`);
  }
  const newAgg = agg.concat([path.key]);
  if (path.prev) {
    return getPath(path.prev, newAgg);
  } else {
    return newAgg;
  }
};

/**
 * Retrieve the selection set field list
 * If some fragments are present, resolve those
 * @param info
 * @param selectionSet Current selection set, used to recurse
 */
const getFieldNodesWithResolvedFragments = (
  info: GraphQLResolveInfo,
  selectionSet: SelectionSetNode | undefined,
) => {
  // extract fragment field nodes
  const fragmentNodes = selectionSet?.selections.filter(
    instanceOfFragmentSpreadNode,
  );
  const fragmendFields = flatMap(fragmentNodes, (f: FragmentSpreadNode) =>
    info.fragments[f.name.value].selectionSet.selections.filter(
      instanceOfFieldNode,
    ),
  );
  // extract "normal" nodes
  const fields = selectionSet?.selections.filter(instanceOfFieldNode);
  return fields?.concat(fragmendFields);
};

/**
 * Retrieve the selection set of the current resolver
 * Even if it is nested inside another resolver
 * @param info the info object
 * @param selectionSet Current selection set, used to recurse
 * @param path Path extracted from info with getPath
 */
const getSelectionSetFromPath = (
  info: GraphQLResolveInfo,
  selectionSet: SelectionSetNode | undefined,
  path: string[],
): SelectionSetNode => {
  const fieldNodes = getFieldNodesWithResolvedFragments(info, selectionSet);
  const fieldNode = fieldNodes?.find((s) => getQueriedName(s) === path[0]);
  if (!fieldNode) {
    return null;
  }
  if (path.length <= 1) {
    return fieldNode.selectionSet || null;
  } else {
    return getSelectionSetFromPath(
      info,
      fieldNode.selectionSet,
      path.slice(1, path.length),
    );
  }
};

/**
 * Find out if a field below the current selection has been queries
 * Usefull to load relations uphill
 * @param info the graphql info object
 * @param childFieldName the path at which you may find the field
 */
export const hasSelectedField = (
  info: GraphQLResolveInfo,
  childFieldPath: string[],
) => {
  const selectionSet = getSelectionSetFromPath(
    info,
    info.operation.selectionSet,
    getPath(info.path)
      .reverse()
      .concat(childFieldPath.slice(0, childFieldPath.length - 1)),
  );
  if (!selectionSet) {
    return false;
  }
  const fieldNodes = getFieldNodesWithResolvedFragments(info, selectionSet);
  const fieldExists = fieldNodes?.some(
    (s) => getQueriedName(s) === childFieldPath[childFieldPath.length - 1],
  );

  return fieldExists;
};

export const getJoinRelation = (
  info: GraphQLResolveInfo,
  fields: Array<string[]>,
  withPagination: boolean,
  forceInclude: string[],
): string[] => {
  const relationFields = [];
  fields.forEach((field) => {
    if (withPagination) {
      field.unshift('items');
    }
    if (hasSelectedField(info, field)) {
      if (withPagination) {
        field.shift();
      }

      relationFields.push(field.join('.'));
    }
  });

  if (forceInclude) {
    return relationFields.concat(forceInclude);
  }

  return relationFields;
};
