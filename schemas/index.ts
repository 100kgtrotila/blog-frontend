import { z } from "zod"

export const postSchema = z.object({
    title: z.string().min(1, "Заголовок обов'язковий").max(255, "Заголовок занадто довгий"),
    slug: z.string().min(1, "Slug обов'язковий").max(255, "Slug занадто довгий"),
    category_id: z.number().min(1, "Категорія обов'язкова").optional().or(z.undefined()),
    excerpt: z.string().max(500, "Короткий опис занадто довгий").optional(),
    content_raw: z.string().min(1, "Контент обов'язковий"),
    is_published: z.boolean(),
    published_at: z.string().optional(),
})

export const categorySchema = z.object({
    title: z.string().min(1, "Назва обов'язкова").max(255, "Назва занадто довга"),
    slug: z.string().min(1, "Slug обов'язковий").max(255, "Slug занадто довгий"),
    parent_id: z.number().optional(),
    description: z.string().max(1000, "Опис занадто довгий").optional(),
})

export type PostFormData = z.infer<typeof postSchema>
export type CategoryFormData = z.infer<typeof categorySchema>
