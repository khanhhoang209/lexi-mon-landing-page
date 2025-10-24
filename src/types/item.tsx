export interface Item {
  itemId: string
  itemName: string
  isPremium: boolean
  categoryId: string
  categoryName: string
  price: number
  imageUrl: string
  description: string
  isActive: boolean
}

export interface Course {
  courseId: string
  title: string
  description: string
  imageUrl: string
  price: number
  isActive: boolean
  courseLenguageId?: string
  courseLenguageName?: string
  createdAt?: string
  updatedAt?: string
}

export interface ItemCategory {
  categoryName: string
  items: Item[]
}
