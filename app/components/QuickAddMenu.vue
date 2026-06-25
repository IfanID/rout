<script setup>
import { ref, computed } from 'vue'

const { t } = useI18n()

const emit = defineEmits(['close'])

const activeForm = ref(null)
const displayAmount = ref('')
const description = ref('')

// REF UNTUK MENANGKAP ELEMEN INPUT LANGSUNG
const amountInputRef = ref(null)

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

const openForm = (type) => {
  activeForm.value = type
  displayAmount.value = ''
  description.value = ''
}

const backToMenu = () => {
  activeForm.value = null
}

// ============================================================
// LOGIC FORMAT SAAT MENGETIK + ATUR POSISI CURSOR
// ============================================================
let _cursorPos = null;

const handleBeforeInput = (e) => {
  _cursorPos = e.target.selectionStart;
};

const handleNominalInput = (e) => {
  const el = e.target;
  const oldVal = el.value;
  let oldSel = el.selectionStart;

  const isDeleting = oldVal.length < displayAmount.value.length;
  if (isDeleting && oldSel === 0 && _cursorPos !== null) {
    oldSel = _cursorPos;
    const charRemoved = displayAmount.value[_cursorPos - 1];
    if (charRemoved && charRemoved !== '.') {
      oldSel = _cursorPos - 1; 
    }
  }
  _cursorPos = null;

  let digitsBeforeCursor = 0;
  for (let i = 0; i < oldSel; i++) {
    if (oldVal[i] !== '.') digitsBeforeCursor++;
  }

  let rawNum = parseInt(
    el.value.replace(/\./g, '').replace(/\D/g, ''),
    10
  ) || 0;

  if (el.value.replace(/\./g, '').length === 0) {
    displayAmount.value = '';
    return;
  }

  const formatted = new Intl.NumberFormat('id-ID').format(rawNum);

  const totalDigits = formatted.replace(/\./g, '').length;
  if (digitsBeforeCursor > totalDigits) {
    digitsBeforeCursor = totalDigits;
  }

  let count = 0;
  let pos = 0;

  while (count < digitsBeforeCursor && pos < formatted.length) {
    if (formatted[pos] !== '.') count++;
    pos++;
  }

  if (displayAmount.value !== formatted) {
    displayAmount.value = formatted;
  }

  setTimeout(() => {
    el.focus();
    el.setSelectionRange(pos, pos);
  }, 0);
}

// ============================================================
// FIX BLUR: PAKSA NATIVE INPUT SESUAI STATE VUE
// ============================================================
const handleBlur = (e) => {
  const el = e.target
  
  // Ambil angka murni langsung dari apa yang tertulis di layar saat ini
  const rawNum = parseInt(el.value.replace(/\D/g, ''), 10) || 0
  
  if (rawNum === 0) {
    displayAmount.value = ''
    el.value = '' // Paksa native input kosong
    return
  }
  
  // Format ulang
  const formatted = new Intl.NumberFormat('id-ID').format(rawNum)
  
  // 1. Update state Vue
  displayAmount.value = formatted
  
  // 2. PAKSA Native HTML Input ikut berubah (Ini kunci penyelesai bugnya!)
  el.value = formatted
}

const submitTransaction = () => {
  const rawAmount = Number(displayAmount.value.replace(/\D/g, ''))

  if (!rawAmount) {
    alert(t('components.quickAddMenu.form.empty_nominal'))
    return
  }

  console.log('Transaksi Disimpan:', {
    type: activeForm.value,
    amount: rawAmount,
    description: description.value
  })

  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="quick-add-overlay">
      
      <div class="quick-add-menu" @click.stop>
        
        <!-- TAMPILAN MENU GRID -->
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

        <!-- TAMPILAN FORM INPUT -->
        <div v-else class="form-container">
          <div class="form-header">
            <button class="back-btn" @click="backToMenu">
              <Icon name="mdi:arrow-left" size="20" />
            </button>
            <span class="form-title" :style="{ color: formColor }">{{ formTitle }}</span>
          </div>

          <form @submit.prevent="submitTransaction" class="form-body">
            <div class="input-group">
              <label class="input-label">{{ t('components.quickAddMenu.form.nominal') }}</label>
              <div class="amount-input-wrapper">
                <span class="currency-prefix">Rp</span>
                <!-- TAMBAHKAN ref="amountInputRef" DI SINI -->
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
                  autofocus
                />
              </div>
            </div>

            <div class="input-group">
              <label class="input-label">{{ t('components.quickAddMenu.form.description') }}</label>
              <input 
                type="text" 
                v-model="description" 
                class="form-input" 
                :placeholder="t('components.quickAddMenu.form.description_placeholder')"
              />
            </div>

            <button type="submit" class="submit-btn" :style="{ backgroundColor: formColor }">
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
    </div>
  </Teleport>
</template>

<style scoped>
.quick-add-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 9998;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}

.quick-add-menu {
  position: absolute;
  bottom: 140px;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  max-width: calc(100vw - 32px);
  background-color: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 28px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  padding: 20px;
  z-index: 9999;
  animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.close-btn-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.close-x-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--md-sys-color-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  transition: var(--transition);
  -webkit-tap-highlight-color: transparent;
}

.close-x-btn:hover {
  background-color: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
  border-color: var(--md-sys-color-error);
}

.close-x-btn:active {
  transform: scale(0.9);
}

.quick-add-header {
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface-variant);
  margin-bottom: 16px;
}

.quick-add-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.quick-add-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px 8px;
  background-color: var(--md-sys-color-surface-variant);
  border-radius: 20px;
  color: var(--md-sys-color-on-surface);
  transition: transform 0.1s, background-color 0.2s;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}

.quick-add-item:active { transform: scale(0.95); }
.quick-add-item:hover { background-color: var(--md-sys-color-outline-variant); }

.qa-icon-bg {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qa-label {
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
}

.bg-success { background-color: rgba(76, 175, 80, 0.2); color: #4caf50; }
.bg-danger { background-color: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container); }
.bg-primary { background-color: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); }
.bg-warning { background-color: rgba(255, 215, 0, 0.2); color: #FFD700; }

.form-container { display: flex; flex-direction: column; }

.form-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--md-sys-color-surface-variant);
  border: none;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  transition: background-color 0.2s;
}

.back-btn:hover { background-color: var(--md-sys-color-outline-variant); }
.form-title { font-size: 1.1rem; font-weight: 700; }

.form-body { display: flex; flex-direction: column; gap: 16px; }
.input-group { display: flex; flex-direction: column; gap: 6px; }
.input-label { font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); font-weight: 500; padding-left: 4px; }

.amount-input-wrapper {
  display: flex;
  align-items: center;
  background-color: var(--md-sys-color-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 16px;
  transition: border-color 0.2s;
}

.amount-input-wrapper:focus-within {
  border-color: var(--md-sys-color-primary);
  background-color: var(--md-sys-color-surface);
}

.currency-prefix {
  padding-left: 16px;
  padding-right: 8px;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface-variant);
}

.amount-input {
  border: none !important;
  background: transparent !important;
  padding: 14px 16px 14px 0;
  flex: 1;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  font-size: 1rem;
  background-color: var(--md-sys-color-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 16px;
  color: var(--md-sys-color-on-surface);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
  font-family: inherit;
}

.form-input:focus {
  border-color: var(--md-sys-color-primary);
  background-color: var(--md-sys-color-surface);
}

.amount-input { font-size: 1.5rem; font-weight: 700; letter-spacing: 0.5px; }

.submit-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 50px;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s, opacity 0.2s;
  margin-top: 8px;
  -webkit-tap-highlight-color: transparent;
}

.submit-btn:active { transform: scale(0.98); }
.submit-btn:hover { opacity: 0.9; }

@media (max-width: 480px) {
  .quick-add-menu { width: calc(100vw - 32px); padding: 16px; }
  .quick-add-item { padding: 12px 8px; }
  .qa-icon-bg { width: 40px; height: 40px; }
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scaleIn { from { transform: translateX(-50%) scale(0.8) translateY(10px); opacity: 0; } to { transform: translateX(-50%) scale(1) translateY(0); opacity: 1; } }
</style>