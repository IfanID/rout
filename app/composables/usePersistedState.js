// usePersistedState.js
// Plugin persisted-state.client.ts sudah menangani baca & tulis localStorage.
// Composable ini hanyalah alias agar API-nya tetap rapi di halaman.
export const usePersistedState = (key, defaultValue) => {
  return useState(key, () => defaultValue)
}