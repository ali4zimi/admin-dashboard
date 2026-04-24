import * as MenuService from '../utils/menu.service'
import type { MenuCategory, MenuItem } from '@restaurant-platform/types'

export interface MenuCategoryWithItems extends MenuCategory {
  items: MenuItem[]
}

export default defineEventHandler(async (): Promise<MenuCategoryWithItems[]> => {
  const [categories, items] = await Promise.all([
    MenuService.fetchAllMenuCategories(),
    MenuService.fetchAllMenuItems(),
  ])

  return categories
    .map((category) => ({
      ...category,
      items: items
        .filter((item) => item.categoryId === category.id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
})
