interface Pagination {
    current_page: number
    per_page: number
    total_pages: number
    total_records: number
    next_page_url?: string
    previous_page_url?: string
}

export interface Data <T>{
    count: number
    items: T[]
    pagination?: Pagination
}

export interface ApiResponse<T> {
    status: number
    detail: string
    data: T
}