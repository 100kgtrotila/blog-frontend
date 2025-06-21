export interface BlogCategory {
    id: number
    title: string
    slug: string
    description?: string
    parent_id?: number
    parent_title?: string
    posts_count?: number
    is_root: boolean
    created_at: string
    updated_at: string
}

export interface BlogPost {
    id: number
    title: string
    slug: string
    excerpt?: string
    content_raw: string
    category_id: number
    is_published: boolean
    published_at?: string
    user: {
        id: number
        name: string
    }
    category: {
        id: number
        title: string
        slug: string
    }
    created_at: string
    updated_at: string
}

export interface PaginatedResponse<T> {
    data: T[]
    meta: {
        current_page: number
        from: number
        last_page: number
        per_page: number
        to: number
        total: number
    }
    links: {
        first: string
        last: string
        prev?: string
        next?: string
    }
}
