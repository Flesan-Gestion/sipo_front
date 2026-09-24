export interface LazyParamsInterface {
    page: number,
    perPage: number,
    orderBy?: string,
    filterText?: string,
    filterFields?: string,
    matchingFilters?: string | null,
}