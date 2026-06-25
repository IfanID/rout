// usePersistedState.js
export const usePersistedState = (key, defaultValue) => {
  const state = useState(key, () => {
    // ✅ Cek localStorage DULU sebelum init state
    if (process.client) {
      try {
        const savedData = localStorage.getItem(key)
        return savedData !== null ? savedData : defaultValue
      } catch (error) {
        console.warn(`Gagal baca localStorage ${key}:`, error)
        return defaultValue
      }
    }
    return defaultValue
  })

  // Watch untuk save setiap perubahan
  if (process.client) {
    watch(state, (newValue) => {
      try {
        localStorage.setItem(key, String(newValue))
      } catch (error) {
        console.warn('Gagal simpan localStorage:', error)
      }
    })
  }

  return state
}