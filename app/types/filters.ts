export type SortKey = '' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';

export interface SortOption {
  key: SortKey;
  label: string;
}

export interface FilterState {
  searchQuery: string;
  selectedCategory: string;
  sortOption: SortKey;
}

export interface FilterContextValue extends FilterState {
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (c: string) => void;
  setSortOption: (s: SortKey) => void;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  searchQuery: '',
  selectedCategory: 'All',
  sortOption: '',
};
