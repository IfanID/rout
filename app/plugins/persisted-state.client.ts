export default defineNuxtPlugin(() => {
  // Daftar semua key yang ingin disimpan di localStorage
  const keysToSync = ['navCenterMenu', 'navFinanceCenter']

  keysToSync.forEach(key => {
    try {
      const savedData = localStorage.getItem(key)
      if (savedData !== null) {
        // Langsung timpa nilai default dari SSR dengan data localStorage
        // Ini terjadi SEBELUM komponen Vue ditampilkan ke layar
        useState(key).value = savedData
      }
    } catch (error) {
      console.warn(`Gagal membaca ${key} dari localStorage:`, error)
    }
  })
})