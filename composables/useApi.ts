import { useRuntimeConfig } from "#app"
import { $fetch } from "ofetch"
import type { PaginatedResponse, BlogPost, BlogCategory } from "~/types"

export const useApi = () => {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBase

    const api = $fetch.create({
        baseURL,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    })

    return {
        // Blog Posts
        getPosts: (page = 1) => api<PaginatedResponse<BlogPost>>(`/blog/posts?page=${page}`),
        getPost: (slug: string) => api<BlogPost>(`/blog/posts/${slug}`),
        createPost: (data: Partial<BlogPost>) => api<BlogPost>("/blog/posts", { method: "POST", body: data }),
        updatePost: (id: number, data: Partial<BlogPost>) =>
            api<BlogPost>(`/blog/posts/${id}`, { method: "PUT", body: data }),
        deletePost: (id: number) => api(`/blog/posts/${id}`, { method: "DELETE" }),

        // Blog Categories
        getCategories: () => api<BlogCategory[]>("/blog/categories-all"), // Всі категорії без пагінації
        getCategoriesPaginated: (page = 1, perPage = 10) =>
            api<PaginatedResponse<BlogCategory>>(`/blog/categories?page=${page}&per_page=${perPage}`), // З пагінацією
        getCategory: (slug: string) => api<BlogCategory>(`/blog/categories/${slug}`),
        createCategory: (data: Partial<BlogCategory>) =>
            api<BlogCategory>("/blog/categories", { method: "POST", body: data }),
        updateCategory: (id: number, data: Partial<BlogCategory>) =>
            api<BlogCategory>(`/blog/categories/${id}`, { method: "PUT", body: data }),
        deleteCategory: (id: number) => api(`/blog/categories/${id}`, { method: "DELETE" }),
        getCategoryPosts: (slug: string, page = 1) =>
            api<PaginatedResponse<BlogPost>>(`/blog/categories/${slug}/posts?page=${page}`),
    }
}
