<script setup>
import { ref, computed, nextTick } from 'vue'

const { t } = useI18n()
const { wallets, defaultWalletId, addTransaction, getWalletBalance } = useFinanceStore()
const { getCategoriesByType, getCategoryById } = useFinanceCategories()
const { showToast } = useNotification() // ✅ Gunakan notifikasi global

const emit = defineEmits(['close'])

const activeForm = ref(null)
const displayAmount = ref('')
const description = ref('')
const selectedWalletId = ref(null)
const selectedToWalletId = ref(null)
const selectedCategoryId = ref(null)

const isWalletDropdownOpen = ref(false)
const isToWalletDropdownOpen = ref(false)
const isCategoryDropdownOpen = ref(false)

const amountInputRef = ref(null)
const walletDropdownRef = ref(null)
const toWalletDropdownRef = ref(null)
const categoryDropdownRef = ref(null)
const isWalletDropdownAbove = ref(false)
const isToWalletDropdownAbove = ref(false)
const isCategoryDropdownAbove = ref(false)

// State untuk perbaikan kursor
let _cursorPos = null

// ========== COMPUTED ==========
const formTitle = computed(() => {
  const titles = {
    income: t('components.quickAddMenu.form.income_title'),
    expense: t('components.quickAddMenu.form.expense_title'),
    transfer: t('components.quickAddMenu.form.transfer_title'),
    debt: t('components.quickAddMenu.form.debt_title')
  }
  return titles[activeForm.value] || t('components.quickAddMenu.title')
})

const formColor = computed(() => {
  const colors = {
    income: 'var(--md-sys-color-primary)',
    expense: 'var(--md-sys-color-error)',
    transfer: 'var(--md-sys-color-tertiary)',
    debt: '#FFD700'
  }
  return colors[activeForm.value] || 'var(--md-sys-color-primary)'
})

const selectedWalletName = computed(() => {
  const w = wallets.value.find(w => w.id === selectedWalletId.value)
  return w ? w.name : ''
})

const selectedToWalletName = computed(() => {
  const w = wallets.value.find(w => w.id === selectedToWalletId.value)
  return w ? w.name : ''
})

const toWalletOptions = computed(() => {
  return wallets.value.filter(w => w.id !== selectedWalletId.value)
})

const currentCategories = computed(() => {
  if (!activeForm.value) return []
  return getCategoriesByType(activeForm.value)
})

const selectedCategory = computed(() => {
  if (!selectedCategoryId.value) return null
  return getCategoryById(selectedCategoryId.value)
})

const selectedCategoryLabel = computed(() => {
  if (!selectedCategory.value) return ''
  return t(selectedCategory.value.labelKey)
})

const showToWallet = computed(() => {
  if (activeForm.value === 'transfer' && selectedCategoryId.value === 'wallet_transfer') {
    return true
  }
  if (activeForm.value === 'debt' && (selectedCategoryId.value === 'loan' || selectedCategoryId.value === 'installment')) {
    return true
  }
  return false
})

const walletLabel = computed(() => {
  return activeForm.value === 'debt'
    ? t('components.quickAddMenu.form.lender_wallet')
    : t('components.quickAddMenu.form.wallet')
})

const toWalletLabel = computed(() => {
  if (activeForm.value === 'debt') return t('components.quickAddMenu.form.borrower_wallet')
  return t('components.quickAddMenu.form.to_wallet')
})

const rawAmount = computed(() => {
  return Number(displayAmount.value.replace(/\D/g, '')) || 0
})

const finePercent = computed(() => {
  if (!showToWallet.value || !selectedCategory.value?.fine) return 0
  return selectedCategory.value.fine
})

const fineAmount = computed(() => {
  if (!rawAmount.value || !finePercent.value) return 0
  return Math.round(rawAmount.value * finePercent.value / 100)
})

const totalWithFine = computed(() => {
  return rawAmount.value + fineAmount.value
})

const formatRupiah = (n) => new Intl.NumberFormat('id-ID').format(n)

const isSubmitDisabled = computed(() => {
  const noAmount = !rawAmount.value
  const noCategory = !selectedCategoryId.value
  const noToWallet = showToWallet.value && !selectedToWalletId.value
  return noAmount || noCategory || noToWallet
})

// ========== METHODS ==========
const openForm = (type) => {
  activeForm.value = type
  displayAmount.value = ''
  description.value = ''
  selectedWalletId.value = defaultWalletId.value
  selectedToWalletId.value = null
  selectedCategoryId.value = null
  closeAllDropdowns()
  nextTick(() => {
    amountInputRef.value?.focus()
  })
}

const backToMenu = () => {
  activeForm.value = null
  closeAllDropdowns()
}

const closeAllDropdowns = () => {
  isWalletDropdownOpen.value = false
  isToWalletDropdownOpen.value = false
  isCategoryDropdownOpen.value = false
}

const checkOverflow = (el) => {
  if (!el) return false
  const rect = el.getBoundingClientRect()
  return rect.bottom > window.innerHeight - 8
}

const toggleWalletDropdown = () => {
  isWalletDropdownOpen.value = !isWalletDropdownOpen.value
  isToWalletDropdownOpen.value = false
  isCategoryDropdownOpen.value = false
  if (isWalletDropdownOpen.value) {
    nextTick(() => {
      isWalletDropdownAbove.value = checkOverflow(walletDropdownRef.value)
    })
  }
}

const toggleToWalletDropdown = () => {
  isToWalletDropdownOpen.value = !isToWalletDropdownOpen.value
  isWalletDropdownOpen.value = false
  isCategoryDropdownOpen.value = false
  if (isToWalletDropdownOpen.value) {
    nextTick(() => {
      isToWalletDropdownAbove.value = checkOverflow(toWalletDropdownRef.value)
    })
  }
}

const toggleCategoryDropdown = () => {
  isCategoryDropdownOpen.value = !isCategoryDropdownOpen.value
  isWalletDropdownOpen.value = false
  isToWalletDropdownOpen.value = false
  if (isCategoryDropdownOpen.value) {
    nextTick(() => {
      isCategoryDropdownAbove.value = checkOverflow(categoryDropdownRef.value)
    })
  }
}

const selectWallet = (id) => {
  selectedWalletId.value = id
  if (selectedToWalletId.value === id) {
    selectedToWalletId.value = null
  }
  isWalletDropdownOpen.value = false
}

const selectToWallet = (id) => {
  selectedToWalletId.value = id
  isToWalletDropdownOpen.value = false
}

const selectCategory = (id) => {
  selectedCategoryId.value = id
  selectedToWalletId.value = null
  isCategoryDropdownOpen.value = false
}

// ========== INPUT NOMINAL (LOGIC KURSOR LAMA) ==========
const handleBeforeInput = (e) => {
  _cursorPos = e.target.selectionStart
}

const handleNominalInput = (e) => {
  const el = e.target
  const oldVal = el.value
  let oldSel = el.selectionStart

  const isDeleting = oldVal.length < displayAmount.value.length
  if (isDeleting && oldSel === 0 && _cursorPos !== null) {
    oldSel = _cursorPos
    const charRemoved = displayAmount.value[_cursorPos - 1]
    if (charRemoved && charRemoved !== '.') {
      oldSel = _cursorPos - 1
    }
  }
  _cursorPos = null

  let digitsBeforeCursor = 0
  for (let i = 0; i < oldSel; i++) {
    if (oldVal[i] !== '.') digitsBeforeCursor++
  }

  let rawNum = parseInt(
    el.value.replace(/\./g, '').replace(/\D/g, ''),
    10
  ) || 0

  if (el.value.replace(/\./g, '').length === 0) {
    displayAmount.value = ''
    return
  }

  const formatted = new Intl.NumberFormat('id-ID').format(rawNum)

  const totalDigits = formatted.replace(/\./g, '').length
  if (digitsBeforeCursor > totalDigits) {
    digitsBeforeCursor = totalDigits
  }

  let count = 0
  let pos = 0

  while (count < digitsBeforeCursor && pos < formatted.length) {
    if (formatted[pos] !== '.') count++
    pos++
  }

  if (displayAmount.value !== formatted) {
    displayAmount.value = formatted
  }

  setTimeout(() => {
    el.focus()
    el.setSelectionRange(pos, pos)
  }, 0)
}

const handleBlur = (e) => {
  const el = e.target
  const rawNum = parseInt(el.value.replace(/\D/g, ''), 10) || 0

  if (rawNum === 0) {
    displayAmount.value = ''
    el.value = ''
    return
  }

  const formatted = new Intl.NumberFormat('id-ID').format(rawNum)
  displayAmount.value = formatted
  el.value = formatted
}

// ========== SUBMIT TRANSAKSI (DENGAN VALIDASI SALDO) ==========
const submitTransaction = () => {
  const rawAmountVal = rawAmount.value

  if (!rawAmountVal) {
    showToast(t('components.quickAddMenu.form.empty_nominal'), 'error')
    return
  }

  if (!selectedCategoryId.value) {
    showToast(t('components.quickAddMenu.form.empty_category'), 'error')
    return
  }

  // Validasi saldo untuk transaksi debt
  if (activeForm.value === 'debt') {
    const lenderBalance = getWalletBalance(selectedWalletId.value)
    if (rawAmountVal > lenderBalance) {
      showToast('Saldo dompet pemberi pinjaman tidak mencukupi!', 'error')
      return
    }
  }

  // Validasi saldo untuk transaksi expense
  if (activeForm.value === 'expense') {
    const expenseBalance = getWalletBalance(selectedWalletId.value)
    if (rawAmountVal > expenseBalance) {
      showToast('Saldo dompet tidak mencukupi!', 'error')
      return
    }
  }

  // Validasi saldo untuk transfer
  if (activeForm.value === 'transfer') {
    const transferBalance = getWalletBalance(selectedWalletId.value)
    if (rawAmountVal > transferBalance) {
      showToast('Saldo dompet sumber tidak mencukupi!', 'error')
      return
    }
  }

  addTransaction({
    walletId: selectedWalletId.value,
    type: activeForm.value,
    categoryId: selectedCategoryId.value,
    amount: rawAmountVal,
    description: description.value,
    toWalletId: showToWallet.value ? selectedToWalletId.value : null,
    finePercent: finePercent.value,
    fineAmount: fineAmount.value,
    totalDebt: totalWithFine.value,
    isPaid: false,
    paidAt: null
  })

  showToast('Transaksi berhasil disimpan', 'success')
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="quick-add-overlay" @click.self="emit('close')">
      <div class="quick-add-menu" @click.stop>

        <div v-if="!activeForm">
          <div class="quick-add-header">{{ t('components.quickAddMenu.title') }}</div>
          <div class="quick-add-grid">
            <div class="quick-add-item" @click="openForm('income')">
              <div class="qa-icon-bg bg-success">
                <Icon name="mdi:arrow-down-bold-circle-outline" size="24" />
              </div>
              <span class="qa-label">{{ t('components.quickAddMenu.income') }}</span>
            </div>
            <div class="quick-add-item" @click="openForm('expense')">
              <div class="qa-icon-bg bg-danger">
                <Icon name="mdi:arrow-up-bold-circle-outline" size="24" />
              </div>
              <span class="qa-label">{{ t('components.quickAddMenu.expense') }}</span>
            </div>
            <div class="quick-add-item" @click="openForm('transfer')">
              <div class="qa-icon-bg bg-primary">
                <Icon name="mdi:swap-horizontal-circle-outline" size="24" />
              </div>
              <span class="qa-label">{{ t('components.quickAddMenu.transfer') }}</span>
            </div>
            <div class="quick-add-item" @click="openForm('debt')">
              <div class="qa-icon-bg bg-warning">
                <Icon name="mdi:hand-coin-outline" size="24" />
              </div>
              <span class="qa-label">{{ t('components.quickAddMenu.debt') }}</span>
            </div>
          </div>
          <div class="close-btn-wrapper">
            <button class="close-x-btn" @click="emit('close')" title="Tutup">
              <Icon name="mdi:close" size="22" />
            </button>
          </div>
        </div>

        <div v-else class="form-container">
          <div class="form-header">
            <button class="back-btn" @click="backToMenu">
              <Icon name="mdi:arrow-left" size="20" />
            </button>
            <span class="form-title" :style="{ color: formColor }">{{ formTitle }}</span>
          </div>

          <form @submit.prevent="submitTransaction" class="form-body">
            <div class="input-group dropdown-item" :class="{ 'z-active': isWalletDropdownOpen }">
              <label class="input-label">{{ walletLabel }}</label>
              <div class="custom-dropdown">
                <button type="button" class="dropdown-trigger" @click="toggleWalletDropdown">
                  <span>{{ selectedWalletName }}</span>
                  <Icon name="material-symbols:arrow-drop-down-rounded" size="20" class="dropdown-arrow" :class="{ 'rotate': isWalletDropdownOpen }" />
                </button>
                <div v-if="isWalletDropdownOpen" ref="walletDropdownRef" class="dropdown-list" :class="{ 'dropdown-above': isWalletDropdownAbove }">
                  <div v-for="w in wallets" :key="w.id" class="dropdown-option" :class="{ 'active': selectedWalletId === w.id }" @click="selectWallet(w.id)">
                    {{ w.name }}
                    <Icon v-if="selectedWalletId === w.id" name="material-symbols:check-rounded" size="18" />
                  </div>
                </div>
              </div>
            </div>

            <div v-if="showToWallet" class="input-group dropdown-item" :class="{ 'z-active': isToWalletDropdownOpen }">
              <label class="input-label">{{ toWalletLabel }}</label>
              <div class="custom-dropdown">
                <button type="button" class="dropdown-trigger" :class="{ 'has-value': selectedToWalletId }" @click="toggleToWalletDropdown">
                  <span :class="{ 'placeholder': !selectedToWalletId }">{{ selectedToWalletName || t('components.quickAddMenu.form.to_wallet_placeholder') }}</span>
                  <Icon name="material-symbols:arrow-drop-down-rounded" size="20" class="dropdown-arrow" :class="{ 'rotate': isToWalletDropdownOpen }" />
                </button>
                <div v-if="isToWalletDropdownOpen" ref="toWalletDropdownRef" class="dropdown-list" :class="{ 'dropdown-above': isToWalletDropdownAbove }">
                  <div v-for="w in toWalletOptions" :key="w.id" class="dropdown-option" :class="{ 'active': selectedToWalletId === w.id }" @click="selectToWallet(w.id)">
                    {{ w.name }}
                    <Icon v-if="selectedToWalletId === w.id" name="material-symbols:check-rounded" size="18" />
                  </div>
                </div>
              </div>
            </div>

            <div class="input-group dropdown-item" :class="{ 'z-active': isCategoryDropdownOpen }">
              <label class="input-label">{{ t('components.quickAddMenu.form.category') }}</label>
              <div class="custom-dropdown">
                <button type="button" class="dropdown-trigger" :class="{ 'has-value': selectedCategoryId }" @click="toggleCategoryDropdown">
                  <span class="category-trigger-content">
                    <Icon v-if="selectedCategory" :name="selectedCategory.icon" size="20" :style="{ color: selectedCategory.color }" class="cat-trigger-icon" />
                    <span :class="{ 'placeholder': !selectedCategoryId }">{{ selectedCategoryLabel || t('components.quickAddMenu.form.category_placeholder') }}</span>
                  </span>
                  <Icon name="material-symbols:arrow-drop-down-rounded" size="20" class="dropdown-arrow" :class="{ 'rotate': isCategoryDropdownOpen }" />
                </button>
                <div v-if="isCategoryDropdownOpen" ref="categoryDropdownRef" class="dropdown-list dropdown-list--category" :class="{ 'dropdown-above': isCategoryDropdownAbove }">
                  <div v-for="cat in currentCategories" :key="cat.id" class="dropdown-option dropdown-option--category" :class="{ 'active': selectedCategoryId === cat.id }" @click="selectCategory(cat.id)">
                    <div class="option-cat-left">
                      <div class="option-cat-icon-bg" :style="{ backgroundColor: selectedCategoryId === cat.id ? cat.color + '25' : 'var(--md-sys-color-surface-variant)' }">
                        <Icon :name="cat.icon" size="18" :style="{ color: selectedCategoryId === cat.id ? cat.color : 'var(--md-sys-color-on-surface-variant)' }" />
                      </div>
                      <span>{{ t(cat.labelKey) }}</span>
                    </div>
                    <Icon v-if="selectedCategoryId === cat.id" name="material-symbols:check-rounded" size="18" :style="{ color: cat.color }" />
                  </div>
                </div>
              </div>
            </div>

            <div class="input-group">
              <label class="input-label">{{ t('components.quickAddMenu.form.nominal') }}</label>
              <div class="amount-input-wrapper">
                <span class="currency-prefix">Rp</span>
                <input
                  ref="amountInputRef"
                  type="text"
                  :value="displayAmount"
                  @beforeinput="handleBeforeInput"
                  @input="handleNominalInput"
                  @blur="handleBlur"
                  class="form-input amount-input"
                  placeholder="0"
                  inputmode="numeric"
                />
              </div>
            </div>

            <div v-if="fineAmount > 0" class="fine-preview">
              <div class="fine-row">
                <span class="fine-label">{{ t('components.quickAddMenu.form.fine') }} ({{ finePercent }}%)</span>
                <span class="fine-value">Rp {{ formatRupiah(fineAmount) }}</span>
              </div>
              <div class="fine-row fine-total">
                <span class="fine-label">{{ t('components.quickAddMenu.form.total') }}</span>
                <span class="fine-value">Rp {{ formatRupiah(totalWithFine) }}</span>
              </div>
            </div>

            <div class="input-group">
              <label class="input-label">{{ t('components.quickAddMenu.form.description') }}</label>
              <input type="text" v-model="description" class="form-input" :placeholder="t('components.quickAddMenu.form.description_placeholder')" />
            </div>

            <button type="submit" class="submit-btn" :class="{ 'disabled': isSubmitDisabled }" :style="!isSubmitDisabled ? { backgroundColor: formColor } : {}" :disabled="isSubmitDisabled">
              {{ t('components.quickAddMenu.form.submit') }}
            </button>
          </form>

          <div class="close-btn-wrapper">
            <button class="close-x-btn" @click="emit('close')" title="Tutup">
              <Icon name="mdi:close" size="22" />
            </button>
          </div>
        </div>

      </div>
      <div v-if="isWalletDropdownOpen || isToWalletDropdownOpen || isCategoryDropdownOpen" class="dropdown-overlay" @click="closeAllDropdowns"></div>
    </div>
  </Teleport>
</template>

<style scoped>
.quick-add-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9998; background-color: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); animation: fadeIn 0.2s ease; }
.quick-add-menu { position: absolute; bottom: 140px; left: 50%; transform: translateX(-50%); width: 320px; max-width: calc(100vw - 32px); background-color: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 28px; box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5); padding: 20px; z-index: 9999; animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.close-btn-wrapper { display: flex; justify-content: center; margin-top: 16px; }
.close-x-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background-color: var(--md-sys-color-surface-variant); border: 1px solid var(--md-sys-color-outline-variant); color: var(--md-sys-color-on-surface-variant); cursor: pointer; transition: var(--transition); -webkit-tap-highlight-color: transparent; }
.close-x-btn:hover { background-color: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container); border-color: var(--md-sys-color-error); }
.close-x-btn:active { transform: scale(0.9); }
.quick-add-header { text-align: center; font-size: 0.9rem; font-weight: 600; color: var(--md-sys-color-on-surface-variant); margin-bottom: 16px; }
.quick-add-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.quick-add-item { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 16px 8px; background-color: var(--md-sys-color-surface-variant); border-radius: 20px; color: var(--md-sys-color-on-surface); transition: transform 0.1s, background-color 0.2s; -webkit-tap-highlight-color: transparent; cursor: pointer; }
.quick-add-item:active { transform: scale(0.95); }
.quick-add-item:hover { background-color: var(--md-sys-color-outline-variant); }
.qa-icon-bg { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
.qa-label { font-size: 0.85rem; font-weight: 500; text-align: center; }
.bg-success { background-color: rgba(76, 175, 80, 0.2); color: #4caf50; }
.bg-danger { background-color: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container); }
.bg-primary { background-color: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); }
.bg-warning { background-color: rgba(255, 215, 0, 0.2); color: #FFD700; }
.form-container { display: flex; flex-direction: column; }
.form-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--md-sys-color-outline-variant); }
.back-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background-color: var(--md-sys-color-surface-variant); border: none; color: var(--md-sys-color-on-surface-variant); cursor: pointer; transition: background-color 0.2s; }
.back-btn:hover { background-color: var(--md-sys-color-outline-variant); }
.form-title { font-size: 1.1rem; font-weight: 700; }
.form-body { display: flex; flex-direction: column; gap: 16px; }
.input-group { display: flex; flex-direction: column; gap: 6px; }
.input-label { font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); font-weight: 500; padding-left: 4px; }
.dropdown-item { position: relative; z-index: 1; }
.dropdown-item.z-active { z-index: 50; }
.custom-dropdown { position: relative; z-index: 20; }
.dropdown-trigger { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 4px; background-color: var(--md-sys-color-surface-variant); color: var(--md-sys-color-on-surface-variant); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 16px; padding: 14px 16px; font-size: 1rem; font-weight: 600; cursor: pointer; outline: none; transition: var(--transition); font-family: inherit; box-sizing: border-box; }
.dropdown-trigger:hover { border-color: var(--md-sys-color-primary); background-color: var(--md-sys-color-surface); }
.dropdown-trigger.has-value { color: var(--md-sys-color-on-surface); }
.dropdown-trigger .placeholder { color: var(--md-sys-color-outline); font-weight: 400; }
.dropdown-arrow { transition: transform 0.2s ease; flex-shrink: 0; }
.dropdown-arrow.rotate { transform: rotate(180deg); }
.dropdown-list { position: absolute; top: calc(100% + 8px); left: 0; width: 100%; background-color: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 12px; box-shadow: var(--shadow-lg); overflow: hidden; z-index: 50; }
.dropdown-list.dropdown-above { top: auto; bottom: calc(100% + 8px); }
.dropdown-option { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; font-size: 0.9rem; cursor: pointer; color: var(--md-sys-color-on-surface); transition: background-color 0.2s; }
.dropdown-option:hover { background-color: var(--md-sys-color-surface-variant); }
.dropdown-option.active { color: var(--md-sys-color-primary); font-weight: 600; background-color: var(--md-sys-color-primary-container); }
.category-trigger-content { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; }
.cat-trigger-icon { flex-shrink: 0; }
.dropdown-list--category { max-height: 280px; overflow-y: auto; }
.dropdown-list--category::-webkit-scrollbar { width: 3px; }
.dropdown-list--category::-webkit-scrollbar-thumb { background-color: var(--md-sys-color-outline-variant); border-radius: 10px; }
.dropdown-option--category { padding: 10px 16px; }
.option-cat-left { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; }
.option-cat-icon-bg { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background-color 0.2s ease; }
.amount-input-wrapper { display: flex; align-items: center; background-color: var(--md-sys-color-surface-variant); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 16px; transition: border-color 0.2s; }
.amount-input-wrapper:focus-within { border-color: var(--md-sys-color-primary); background-color: var(--md-sys-color-surface); }
.currency-prefix { padding-left: 16px; padding-right: 8px; font-size: 1.2rem; font-weight: 700; color: var(--md-sys-color-on-surface-variant); }
.form-input { width: 100%; padding: 14px 16px; font-size: 1rem; background-color: var(--md-sys-color-surface-variant); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 16px; color: var(--md-sys-color-on-surface); outline: none; box-sizing: border-box; transition: border-color 0.2s; font-family: inherit; }
.form-input:focus { border-color: var(--md-sys-color-primary); background-color: var(--md-sys-color-surface); }
.amount-input { border: none !important; background: transparent !important; padding: 14px 16px 14px 0; flex: 1; font-size: 1.5rem; font-weight: 700; letter-spacing: 0.5px; }
.fine-preview { background-color: color-mix(in srgb, #FFD700 8%, var(--md-sys-color-surface-variant)); border: 1px solid color-mix(in srgb, #FFD700 20%, var(--md-sys-color-outline-variant)); border-radius: 12px; padding: 10px 14px; }
.fine-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
.fine-row + .fine-row { border-top: 1px solid color-mix(in srgb, #FFD700 15%, var(--md-sys-color-outline-variant)); margin-top: 4px; padding-top: 8px; }
.fine-total .fine-value { color: #FFD700; font-weight: 700; font-size: 0.95rem; }
.fine-label { font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); }
.fine-value { font-size: 0.85rem; color: var(--md-sys-color-on-surface); font-weight: 600; font-variant-numeric: tabular-nums; }
.submit-btn { width: 100%; padding: 16px; border: none; border-radius: 50px; color: #ffffff; font-size: 1rem; font-weight: 700; cursor: pointer; transition: transform 0.1s, opacity 0.2s, background-color 0.2s; margin-top: 8px; -webkit-tap-highlight-color: transparent; }
.submit-btn:active:not(.disabled) { transform: scale(0.98); }
.submit-btn:hover:not(.disabled) { opacity: 0.9; }
.submit-btn.disabled { background-color: var(--md-sys-color-surface-variant) !important; color: var(--md-sys-color-outline) !important; cursor: not-allowed; opacity: 0.7; }
.dropdown-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9990; background-color: transparent; }
@media (max-width: 480px) { .quick-add-menu { width: calc(100vw - 32px); padding: 16px; } .quick-add-item { padding: 12px 8px; } .qa-icon-bg { width: 40px; height: 40px; } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scaleIn { from { transform: translateX(-50%) scale(0.8) translateY(10px); opacity: 0; } to { transform: translateX(-50%) scale(1) translateY(0); opacity: 1; } }
</style>