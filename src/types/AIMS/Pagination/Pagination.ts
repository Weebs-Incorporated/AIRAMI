export interface PaginationInput {
    /** Starts at 0. */
    page: number;
    /** 1 - 100 (inclusive). */
    perPage: number;
}

export interface PaginationResponse {
    /** Number of items in total. */
    itemCount: number;
}
