export const DEFAULT_PAGE_SIZE = 10;

export interface PageSort {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
}

export interface PageDetails {
    pageNumber: number;
    pageSize: number;
    sort: PageSort;
    offset: number;
    paged: boolean;
    unpaged: boolean;
}

export interface PaginatedResponse<T> {
    content: T[];
    pageable: PageDetails;
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    number: number;
    sort: PageSort;
    numberOfElements: number;
    first: boolean;
    empty: boolean;
}
