export default defineNuxtPlugin(() => {
  // Daftar semua key yang ingin disinkronkan dengan localStorage
  const keysToSync = ['navCenterMenu', 'navFinanceCenter', 'isBalanceHidden']

  keysToSync.forEach(key => {
    // 1. BACA: Timpa nilai default SSR dengan data localStorage (CEGAH FOUC)
    try {
      const savedData = localStorage.getItem(key)
      if (savedData !== null) {
        useState(key).value = savedData === 'true' ? true : (savedData === 'false' ? false : savedData)
      }
    } catch (error) {
      console.warn(`Gagal membaca ${key} dari localStorage:`, error)
    }

    // 2. TULIS: Setiap perubahan useState → otomatis simpan ke localStorage
    watch(
      () => useState(key).value,
      (newValue) => {
        try {
          localStorage.setItem(key, String(newValue))
        } catch (error) {
          console.warn(`Gagal menyimpan ${key} ke localStorage:`, error)
        }
      }
    )
  })
})