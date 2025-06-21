import { z } from "zod"

// Схема для категорії
export const categorySchema = z.object({
    title: z.string().min(1, "Назва обов'язкова").max(255, "Назва занадто довга"),
    slug: z.string().min(1, "Slug обов'язковий").max(255, "Slug занадто довгий"),
    description: z.string().max(1000, "Опис занадто довгий").optional(),
    parent_id: z.number().positive("ID батьківської категорії має бути позитивним").optional().nullable(),
})

export type CategoryFormData = z.infer<typeof categorySchema>

// Схема для посту
export const postSchema = z.object({
    title: z.string().min(1, "Заголовок обов'язковий").max(255, "Заголовок занадто довгий"),
    slug: z.string().max(255, "Slug занадто довгий").optional(),
    category_id: z.number().min(1, "Категорія обов'язкова"),
    excerpt: z.string().max(500, "Короткий опис занадто довгий").optional(),
    content_raw: z.string().min(1, "Контент обов'язковий"),
    is_published: z.boolean().default(false),
    published_at: z.string().optional(),
})

export type PostFormData = z.infer<typeof postSchema>
