import React, { createContext, useState, ReactNode } from 'react';
import { DEFAULT_FILTER_STATE, FilterContextValue, SortKey } from '../types/filters';

const FilterContext = createContext<FilterContextValue>({
  ...DEFAULT_FILTER_STATE,
  setSearchQuery: () => {},
  setSelectedCategory: () => {},
  setSortOption: () => {},
});

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [searchQuery, setSearchQuery] = useState<string>(DEFAULT_FILTER_STATE.searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(DEFAULT_FILTER_STATE.selectedCategory);
  const [sortOption, setSortOption] = useState<SortKey>(DEFAULT_FILTER_STATE.sortOption as SortKey);

  const value: FilterContextValue = {
    searchQuery,
    selectedCategory,
    sortOption,
    setSearchQuery,
    setSelectedCategory,
    setSortOption,
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

export default FilterContext;
