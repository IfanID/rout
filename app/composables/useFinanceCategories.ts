import groupedRaw from '~/assets/data/finance/categories.json'

/**
 * Finance Categories — Data-Driven Composable (Grouped Structure)
 * ===============================================================
 * JSON file menggunakan struktur bertingkat (grouped by type).
 * Composable melakukan flatten internal & expose API flat yang konsisten.
 *
 * Flow:
 *   categories.json (grouped)
 *        │
 *        ▼
 *   validateGrouped() + flatten + sort
 *        │
 *        ▼
 *   useState (cache, sekali load)
 *        │
 *        ▼
 *   Public API (flat array)
 *        │
 *        ▼
 *   Seluruh UI (tidak tahu soal struktur JSON)
 */

// =============================================
// INTERFACE (Future-Proof)
// =============================================
export interface FinanceCategory {
  id: string
  labelKey: string
  type: 'income' | 'expense' | 'transfer' | 'debt'
  icon: string
  color: string
  fine?: number
  order?: number
  group?: string
  hidden?: boolean
  premium?: boolean
  favorite?: boolean
  descriptionKey?: string
  emoji?: string
  [key: string]: unknown
}

// Internal: struktur item di dalam JSON (tanpa `type`, karena inferred)
interface RawCategoryItem {
  id: string
  labelKey: string
  icon: string
  color: string
  fine?: number
  order?: number
  group?: string
  hidden?: boolean
  premium?: boolean
  favorite?: boolean
  descriptionKey?: string
  emoji?: string
  [key: string]: unknown
}

type CategoryType = 'income' | 'expense' | 'transfer' | 'debt'
type GroupedRawData = Partial<Record<CategoryType, RawCategoryItem[]>>

// =============================================
// CONSTANTS
// =============================================
const VALID_TYPES: readonly CategoryType[] = ['income', 'expense', 'transfer', 'debt'] as const
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/
const STATE_KEY = 'finance-categories-data'

// =============================================
// VALIDASI + FLATTEN
// =============================================
function validateAndFlatten(data: GroupedRawData): FinanceCategory[] {
  const seenIds = new Set<string>()
  const result: FinanceCategory[] = []

  VALID_TYPES.forEach((type) => {
    const items = data[type]
    if (!items) return
    if (!Array.isArray(items)) {
      console.warn(`[FinanceCategories] Section "${type}" bukan array, di-skip.`)
      return
    }

    items.forEach((raw, idx) => {
      const prefix = `[FinanceCategories] ${type}[${idx}]`

      // ---- Required fields ----
      if (!raw.id || typeof raw.id !== 'string') {
        console.warn(`${prefix}: 'id' tidak valid, di-skip.`)
        return
      }
      if (!raw.labelKey || typeof raw.labelKey !== 'string') {
        console.warn(`${prefix} (${raw.id}): 'labelKey' kosong, di-skip.`)
        return
      }
      if (!raw.icon || typeof raw.icon !== 'string') {
        console.warn(`${prefix} (${raw.id}): 'icon' kosong, di-skip.`)
        return
      }

      // ---- Duplicate ID (global) ----
      if (seenIds.has(raw.id)) {
        console.warn(`${prefix}: id "${raw.id}" duplikat, di-skip.`)
        return
      }
      seenIds.add(raw.id)

      // ---- Color validation (soft) ----
      let color = typeof raw.color === 'string' ? raw.color : '#9ca3af'
      if (!HEX_COLOR_REGEX.test(color) && !color.startsWith('var(')) {
        console.warn(`${prefix} (${raw.id}): 'color' tidak valid ("${color}"), pakai default.`)
        color = '#9ca3af'
      }

      // ---- Fine hanya valid di debt ----
      const category: FinanceCategory = {
        ...raw,
        id: raw.id,
        labelKey: raw.labelKey,
        type,           // ← Inject dari parent key
        icon: raw.icon,
        color,
      }

      if (raw.fine !== undefined) {
        if (type !== 'debt') {
          console.warn(`${prefix} (${raw.id}): 'fine' hanya valid untuk debt, diabaikan.`)
          delete category.fine
        } else {
          category.fine = typeof raw.fine === 'number' ? raw.fine : 0
        }
      }

      result.push(category)
    })
  })

  return result
}

// =============================================
// SORTING
// =============================================
function sortCategories(data: FinanceCategory[]): FinanceCategory[] {
  return [...data].sort((a, b) => {
    const orderA = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER
    const orderB = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER
    return orderA - orderB
  })
}

// =============================================
// COMPOSABLE
// =============================================
export const useFinanceCategories = () => {
  // Caching via useState — dibaca & di-flatten sekali (SSR-safe)
  const categories = useState<FinanceCategory[]>(STATE_KEY, () => {
    const flattened = validateAndFlatten(groupedRaw as unknown as GroupedRawData)
    return Object.freeze(sortCategories(flattened))
  })

  // =============================================
  // CORE GETTERS
  // =============================================
  const getCategories = (): FinanceCategory[] => {
    return categories.value
  }

  const getCategoriesByType = (type: string): FinanceCategory[] => {
    return categories.value.filter(c => c.type === type && !c.hidden)
  }

  const getCategoryById = (id: string): FinanceCategory | undefined => {
    return categories.value.find(c => c.id === id)
  }

  // =============================================
  // TYPE-SPECIFIC GETTERS
  // =============================================
  const getIncomeCategories   = (): FinanceCategory[] => getCategoriesByType('income')
  const getExpenseCategories  = (): FinanceCategory[] => getCategoriesByType('expense')
  const getTransferCategories = (): FinanceCategory[] => getCategoriesByType('transfer')
  const getDebtCategories     = (): FinanceCategory[] => getCategoriesByType('debt')

  // =============================================
  // SEARCH (memerlukan i18n untuk translate)
  // =============================================
  const searchCategories = (keyword: string): FinanceCategory[] => {
    if (!keyword?.trim()) return categories.value

    let t: (key: string) => string
    try {
      t = useI18n().t
    } catch {
      // Fallback kalau dipanggil di luar setup (edge case)
      t = (key: string) => key
    }

    const q = keyword.toLowerCase()
    return categories.value.filter(c => {
      if (c.hidden) return false
      const translated = t(c.labelKey).toLowerCase()
      return (
        c.id.toLowerCase().includes(q) ||
        translated.includes(q) ||
        c.labelKey.toLowerCase().includes(q) ||
        (typeof c.emoji === 'string' && c.emoji.toLowerCase().includes(q)) ||
        false
      )
    })
  }

  // =============================================
  // GROUPING (untuk UI masa depan)
  // =============================================
  const getCategoriesByGroup = (group: string): FinanceCategory[] => {
    return categories.value.filter(c => c.group === group)
  }

  const getGroupsByType = (type: string): Record<string, FinanceCategory[]> => {
    const result: Record<string, FinanceCategory[]> = {}
    categories.value
      .filter(c => c.type === type && !c.hidden)
      .forEach(c => {
        const g = (c.group as string) || '__default__'
        if (!result[g]) result[g] = []
        result[g].push(c)
      })
    return result
  }

  return {
    // Data
    categories: readonly(categories),

    // Core getters
    getCategories,
    getCategoriesByType,
    getCategoryById,

    // Type-specific
    getIncomeCategories,
    getExpenseCategories,
    getTransferCategories,
    getDebtCategories,

    // Search
    searchCategories,

    // Grouping (future-ready)
    getCategoriesByGroup,
    getGroupsByType,
  }
}
