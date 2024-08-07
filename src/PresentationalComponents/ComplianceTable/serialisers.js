// TODO correct the serialiser to transform state put into the tablestate to be API consumable
export const paginationSerialiser = (state) =>
  `offset=${state.page}&limit=${state.perPage}`;

const textFilterSerialiser = (filterConfigItem, value) =>
  `${filterConfigItem.filterAttribute} ~ '${value}'`;

const checkboxFilterSerialiser = (filterConfigItem, values) =>
  `${filterConfigItem.filterAttribute} IN (${values
    .map((value) => `'${value}'`)
    .join(', ')})`;

const raidoFilterSerialiser = (filterConfigItem, values) =>
  `${filterConfigItem.filterAttribute} = '${values[0]}'`;

const filterSerialisers = {
  text: textFilterSerialiser,
  checkbox: checkboxFilterSerialiser,
  radio: raidoFilterSerialiser,
};

const findFilterSerialiser = (filterConfigItem) => {
  if (filterConfigItem.filterSerialiser) {
    return filterConfigItem.filterSerialiser;
  } else {
    return (
      filterConfigItem.filterAttribute &&
      filterSerialisers[filterConfigItem?.type]
    );
  }
};

/**
 *  Takes an AsyncTableToolsTable state and transforms it into a Compliance scoped search filter parameter
 *
 *  @param {object} state Table state
 *  @param {object} filters AsyncTableToolsTable filter configuration
 *
 *  @returns {string | undefined} Compliance scoped search filter string
 *
 *  @category Compliance
 *
 */
export const filtersSerialiser = (state, filters) => {
  const queryParts = Object.entries(state).reduce(
    (filterQueryParts, [filterId, value]) => {
      const filterConfigItem = filters.find((filter) => filter.id === filterId);
      const filterSerialiser = findFilterSerialiser(filterConfigItem);

      return [
        ...filterQueryParts,
        ...(filterSerialiser
          ? [filterSerialiser(filterConfigItem, value)]
          : []),
      ];
    },
    []
  );

  return queryParts.length > 0 ? queryParts.join(' AND ') : undefined;
};
