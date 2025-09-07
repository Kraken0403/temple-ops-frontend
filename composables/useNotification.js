import { ref } from 'vue'

const notification = ref({
  message: '',
  type: 'success', // or 'error'
  visible: false
})

let timeoutId = null

export const useNotification = () => {
  const showNotification = (message, type = 'success', duration = 3000) => {
    notification.value = { message, type, visible: true }

    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      notification.value.visible = false
    }, duration)
  }

  return {
    notification,
    showNotification
  }
}
