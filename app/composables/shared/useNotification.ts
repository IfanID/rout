export const useNotification = () => {
  const toast = useState('globalToast', () => ({
    show: false,
    message: '',
    type: 'info' // 'success' | 'error' | 'warning' | 'info'
  }))

  let timer = null

  const showToast = (message, type = 'info', duration = 3000) => {
    if (timer) clearTimeout(timer)
    toast.value = { show: true, message, type }
    timer = setTimeout(() => {
      toast.value = { show: false, message: '', type: 'info' }
    }, duration)
  }

  return { toast, showToast }
}