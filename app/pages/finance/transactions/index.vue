<template>
  <div class="tx-page">
    <!-- ========== LOADING STATE ========== -->
    <SkeletonAppSkeletonLoader :show="!isMounted" size="md" fullscreen />

    <!-- ========== ERROR STATE ========== -->
    <div v-if="isMounted && hasError" class="tx-state tx-state--error">
      <div class="tx-state__icon-wrap tx-state__icon-wrap--error">
        <Icon name="material-symbols:error-outline-rounded" size="48" />
      </div>
      <h2 class="tx-state__title">{{ t('pages.finance.transactions.error_title') }}</h2>
      <p class="tx-state__desc">{{ t('pages.finance.transactions.error_desc') }}</p>
      <button class="tx-state__btn tx-state__btn--error" @click="retryLoad">
        <Icon name="material-symbols:refresh-rounded" size="20" />
        {{ t('pages.finance.transactions.error_retry') }}
      </button>
    </div>

    <!-- ========== MAIN CONTENT ========== -->
    <template v-if="isMounted && !hasError">
      <!-- HEADER -->
      <header class="tx-header">
        <div class="tx-header__text">
          <h1 class="tx-header__title">{{ t('pages.finance.transactions.title') }}</h1>
          <p class="tx-header__subtitle">{{ t('pages.finance.transactions.subtitle') }}</p>
        </div>
        <span class="tx-header__count">
          {{ t('pages.finance.transactions.showing_count', [summaryData.count]) }}
        </span>
      </header>

      <!-- SUMMARY CARDS - COMPACT ON MOBILE -->
      <section class="tx-summary">
        <div class="tx-summary__card">
          <div class="tx-summary__icon tx-summary__icon--total">
            <Icon name="material-symbols:receipt-long-outline-rounded" size="20" />
          </div>
          <div class="tx-summary__info">
            <span class="tx-summary__label">{{ t('pages.finance.transactions.summary_total') }}</span>
            <span class="tx-summary__value">{{ summaryData.count }}</span>
          </div>
        </div>
        <div class="tx-summary__card">
          <div class="tx-summary__icon tx-summary__icon--income">
            <Icon name="material-symbols:arrow-downward-rounded" size="20" />
          </div>
          <div class="tx-summary__info">
            <span class="tx-summary__label">{{ t('pages.finance.transactions.summary_income') }}</span>
            <span class="tx-summary__value tx-summary__value--income">Rp{{ formatRupiah(summaryData.totalIncome) }}</span>
          </div>
        </div>
        <div class="tx-summary__card">
          <div class="tx-summary__icon tx-summary__icon--expense">
            <Icon name="material-symbols:arrow-upward-rounded" size="20" />
          </div>
          <div class="tx-summary__info">
            <span class="tx-summary__label">{{ t('pages.finance.transactions.summary_expense') }}</span>
            <span class="tx-summary__value tx-summary__value--expense">Rp{{ formatRupiah(summaryData.totalExpense) }}</span>
          </div>
        </div>
      </section>

      <!-- SEARCH -->
      <div class="tx-search">
        <Icon name="material-symbols:search-rounded" size="20" class="tx-search__icon" />
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          class="tx-search__input"
          :placeholder="t('pages.finance.transactions.search_placeholder')"
        />
        <button
          v-if="searchQuery"
          class="tx-search__clear"
          @click="searchQuery = ''"
        >
          <Icon name="material-symbols:close-rounded" size="18" />
        </button>
      </div>

      <!-- FILTER BAR -->
      <div class="tx-filters">
        <!-- Category Filter -->
        <button
          class="tx-filter-btn"
          :class="{ 'tx-filter-btn--active': filterCategory }"
          @click="togglePopover('category')"
        >
          <Icon name="material-symbols:category-outline-rounded" size="16" />
          <span>{{ t('pages.finance.transactions.filter_category') }}</span>
          <Icon name="material-symbols:arrow-drop-down-rounded" size="18" class="tx-filter-btn__arrow" :class="{ 'tx-filter-btn__arrow--open': activePopover === 'category' }" />
        </button>

        <!-- Wallet Filter -->
        <button
          class="tx-filter-btn"
          :class="{ 'tx-filter-btn--active': filterWallet }"
          @click="togglePopover('wallet')"
        >
          <Icon name="material-symbols:wallet-outline-rounded" size="16" />
          <span>{{ t('pages.finance.transactions.filter_wallet') }}</span>
          <Icon name="material-symbols:arrow-drop-down-rounded" size="18" class="tx-filter-btn__arrow" :class="{ 'tx-filter-btn__arrow--open': activePopover === 'wallet' }" />
        </button>

        <!-- Type Filter -->
        <button
          class="tx-filter-btn"
          :class="{ 'tx-filter-btn--active': filterType }"
          @click="togglePopover('type')"
        >
          <Icon name="material-symbols:filter-alt-outline-rounded" size="16" />
          <span>{{ t('pages.finance.transactions.filter_type') }}</span>
          <Icon name="material-symbols:arrow-drop-down-rounded" size="18" class="tx-filter-btn__arrow" :class="{ 'tx-filter-btn__arrow--open': activePopover === 'type' }" />
        </button>

        <!-- Date Filter -->
        <button
          class="tx-filter-btn"
          :class="{ 'tx-filter-btn--active': filterDateFrom || filterDateTo }"
          @click="togglePopover('date')"
        >
          <Icon name="material-symbols:calendar-month-outline-rounded" size="16" />
          <span>{{ t('pages.finance.transactions.filter_date') }}</span>
          <Icon name="material-symbols:arrow-drop-down-rounded" size="18" class="tx-filter-btn__arrow" :class="{ 'tx-filter-btn__arrow--open': activePopover === 'date' }" />
        </button>

        <!-- Sort -->
        <button class="tx-filter-btn tx-filter-btn--sort" @click="toggleSort">
          <Icon :name="sortOrder === 'newest' ? 'material-symbols:arrow-downward-rounded' : 'material-symbols:arrow-upward-rounded'" size="16" />
          <span>{{ sortOrder === 'newest' ? t('pages.finance.transactions.sort_newest') : t('pages.finance.transactions.sort_oldest') }}</span>
        </button>

        <!-- Reset -->
        <button
          v-if="activeFilterCount > 0"
          class="tx-filter-btn tx-filter-btn--reset"
          @click="resetFilters"
          :title="t('pages.finance.transactions.reset_filter')"
        >
          <Icon name="material-symbols:refresh-rounded" size="18" />
        </button>
      </div>

      <!-- ACTIVE FILTER CHIPS -->
      <Transition name="chips-fade">
        <div v-if="activeFilterChips.length" class="tx-chips">
          <div
            v-for="chip in activeFilterChips"
            :key="chip.id"
            class="tx-chip"
          >
            <span
              v-if="chip.color"
              class="tx-chip__dot"
              :style="{ backgroundColor: chip.color }"
            ></span>
            <span class="tx-chip__label">{{ chip.label }}</span>
            <button class="tx-chip__remove" @click="removeChip(chip.id)">
              <Icon name="material-symbols:close-rounded" size="14" />
            </button>
          </div>
        </div>
      </Transition>

      <!-- EMPTY STATE -->
      <div v-if="filteredTransactions.length === 0" class="tx-state tx-state--empty">
        <div class="tx-state__icon-wrap tx-state__icon-wrap--empty">
          <Icon name="material-symbols:receipt-long-outline-rounded" size="56" />
        </div>
        <h2 class="tx-state__title">{{ t('pages.finance.transactions.empty_title') }}</h2>
        <p class="tx-state__desc">{{ t('pages.finance.transactions.empty_desc') }}</p>
        <button class="tx-state__btn tx-state__btn--primary" @click="navigateTo('/finance')">
          <Icon name="material-symbols:add-rounded" size="20" />
          {{ t('pages.finance.transactions.empty_add') }}
        </button>
      </div>

      <!-- TRANSACTION GROUPS -->
      <div v-else class="tx-groups">
        <div v-for="group in groupedTransactions" :key="group.key" class="tx-group">
          <div class="tx-group__header">
            <span class="tx-group__label">{{ group.label }}</span>
            <span class="tx-group__count">{{ group.items.length }}</span>
          </div>

          <div class="tx-group__list">
            <button
              v-for="tx in group.items"
              :key="tx.id"
              class="tx-card"
              @click="openDetail(tx)"
            >
              <!-- Left: Icon -->
              <div
                class="tx-card__icon"
                :style="{ backgroundColor: (getCategoryById(tx.categoryId)?.color || 'var(--md-sys-color-primary)') + '18', color: getCategoryById(tx.categoryId)?.color || 'var(--md-sys-color-primary)' }"
              >
                <Icon :name="getCategoryById(tx.categoryId)?.icon || 'material-symbols:help-outline-rounded'" size="22" />
              </div>

              <!-- Middle: Info -->
              <div class="tx-card__info">
                <div class="tx-card__top-row">
                  <span class="tx-card__name">
                    {{ tx.description || (getCategoryById(tx.categoryId) ? t(getCategoryById(tx.categoryId).labelKey) : '-') }}
                  </span>
                  <span
                    class="tx-card__amount"
                    :style="{ color: getAmountColor(tx.type) }"
                  >
                    {{ getAmountPrefix(tx.type) }}Rp{{ formatRupiah(tx.amount) }}
                  </span>
                </div>
                <div class="tx-card__bottom-row">
                  <span class="tx-card__meta">
                    {{ getCategoryById(tx.categoryId) ? t(getCategoryById(tx.categoryId).labelKey) : '-' }}
                    <span class="tx-card__meta-dot">·</span>
                    {{ getWalletName(tx.walletId) }}
                  </span>
                  <span class="tx-card__time">{{ formatTime(tx.createdAt) }}</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ========== FILTER POPOVERS ========== -->
    <Teleport to="body">
      <Transition name="popover-fade">
        <div v-if="activePopover" class="tx-popover-overlay" @click="closePopover">
          <!-- Category Popover -->
          <div
            v-if="activePopover === 'category'"
            class="tx-popover"
            @click.stop
          >
            <div class="tx-popover__header">
              <span class="tx-popover__title">{{ t('pages.finance.transactions.filter_category') }}</span>
              <button class="tx-popover__close" @click="closePopover">
                <Icon name="material-symbols:close-rounded" size="20" />
              </button>
            </div>
            <div class="tx-popover__body">
              <button
                class="tx-popover__option"
                :class="{ 'tx-popover__option--active': !filterCategory }"
                @click="selectCategory('')"
              >
                <span>{{ t('pages.finance.transactions.filter_all_categories') }}</span>
                <Icon v-if="!filterCategory" name="material-symbols:check-rounded" size="18" />
              </button>
              <button
                v-for="cat in categories"
                :key="cat.id"
                class="tx-popover__option"
                :class="{ 'tx-popover__option--active': filterCategory === cat.id }"
                @click="selectCategory(cat.id)"
              >
                <div class="tx-popover__option-left">
                  <div class="tx-popover__option-icon" :style="{ backgroundColor: cat.color + '20', color: cat.color }">
                    <Icon :name="cat.icon" size="16" />
                  </div>
                  <span>{{ t(cat.labelKey) }}</span>
                </div>
                <Icon v-if="filterCategory === cat.id" name="material-symbols:check-rounded" size="18" class="tx-popover__check" />
              </button>
            </div>
          </div>

          <!-- Wallet Popover -->
          <div
            v-if="activePopover === 'wallet'"
            class="tx-popover"
            @click.stop
          >
            <div class="tx-popover__header">
              <span class="tx-popover__title">{{ t('pages.finance.transactions.filter_wallet') }}</span>
              <button class="tx-popover__close" @click="closePopover">
                <Icon name="material-symbols:close-rounded" size="20" />
              </button>
            </div>
            <div class="tx-popover__body">
              <button
                class="tx-popover__option"
                :class="{ 'tx-popover__option--active': !filterWallet }"
                @click="selectWallet('')"
              >
                <span>{{ t('pages.finance.transactions.filter_all_wallets') }}</span>
                <Icon v-if="!filterWallet" name="material-symbols:check-rounded" size="18" />
              </button>
              <button
                v-for="w in wallets"
                :key="w.id"
                class="tx-popover__option"
                :class="{ 'tx-popover__option--active': filterWallet === w.id }"
                @click="selectWallet(w.id)"
              >
                <div class="tx-popover__option-left">
                  <div class="tx-popover__option-icon tx-popover__option-icon--wallet">
                    <Icon name="material-symbols:wallet-outline-rounded" size="16" />
                  </div>
                  <span>{{ w.name }}</span>
                </div>
                <Icon v-if="filterWallet === w.id" name="material-symbols:check-rounded" size="18" class="tx-popover__check" />
              </button>
            </div>
          </div>

          <!-- Type Popover -->
          <div
            v-if="activePopover === 'type'"
            class="tx-popover"
            @click.stop
          >
            <div class="tx-popover__header">
              <span class="tx-popover__title">{{ t('pages.finance.transactions.filter_type') }}</span>
              <button class="tx-popover__close" @click="closePopover">
                <Icon name="material-symbols:close-rounded" size="20" />
              </button>
            </div>
            <div class="tx-popover__body">
              <button
                class="tx-popover__option"
                :class="{ 'tx-popover__option--active': !filterType }"
                @click="selectType('')"
              >
                <span>{{ t('pages.finance.transactions.filter_all_types') }}</span>
                <Icon v-if="!filterType" name="material-symbols:check-rounded" size="18" />
              </button>
              <button
                v-for="opt in typeOptions"
                :key="opt.value"
                class="tx-popover__option"
                :class="{ 'tx-popover__option--active': filterType === opt.value }"
                @click="selectType(opt.value)"
              >
                <div class="tx-popover__option-left">
                  <div class="tx-popover__option-icon" :style="{ backgroundColor: opt.color + '20', color: opt.color }">
                    <Icon :name="opt.icon" size="16" />
                  </div>
                  <span>{{ opt.label }}</span>
                </div>
                <Icon v-if="filterType === opt.value" name="material-symbols:check-rounded" size="18" class="tx-popover__check" />
              </button>
            </div>
          </div>

          <!-- Date Popover -->
          <div
            v-if="activePopover === 'date'"
            class="tx-popover tx-popover--date"
            @click.stop
          >
            <div class="tx-popover__header">
              <span class="tx-popover__title">{{ t('pages.finance.transactions.filter_date') }}</span>
              <button class="tx-popover__close" @click="closePopover">
                <Icon name="material-symbols:close-rounded" size="20" />
              </button>
            </div>
            <div class="tx-popover__body tx-popover__body--date">
              <div class="tx-date-field">
                <label class="tx-date-field__label">{{ t('pages.finance.transactions.date_from') }}</label>
                <input type="date" v-model="filterDateFrom" class="tx-date-field__input" />
              </div>
              <div class="tx-date-field">
                <label class="tx-date-field__label">{{ t('pages.finance.transactions.date_to') }}</label>
                <input type="date" v-model="filterDateTo" class="tx-date-field__input" />
              </div>
              <div class="tx-popover__actions">
                <button class="tx-popover__action-btn tx-popover__action-btn--clear" @click="filterDateFrom = ''; filterDateTo = ''">
                  {{ t('pages.finance.transactions.clear') }}
                </button>
                <button class="tx-popover__action-btn tx-popover__action-btn--apply" @click="closePopover">
                  {{ t('pages.finance.transactions.apply') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ========== DETAIL MODAL ========== -->
    <Teleport to="body">
      <Transition name="detail-fade">
        <div v-if="showDetail && selectedTransaction" class="tx-detail-overlay" @click.self="closeDetail">
          <div class="tx-detail" :class="{ 'tx-detail--enter': showDetail }">
            <!-- Detail Header -->
            <div class="tx-detail__header">
              <div class="tx-detail__header-left">
                <div
                  class="tx-detail__cat-icon"
                  :style="{
                    backgroundColor: (getCategoryById(selectedTransaction.categoryId)?.color || 'var(--md-sys-color-primary)') + '20',
                    color: getCategoryById(selectedTransaction.categoryId)?.color || 'var(--md-sys-color-primary)'
                  }"
                >
                  <Icon :name="getCategoryById(selectedTransaction.categoryId)?.icon || 'material-symbols:help-outline-rounded'" size="28" />
                </div>
                <div class="tx-detail__header-info">
                  <h2 class="tx-detail__title">
                    {{ selectedTransaction.description || (getCategoryById(selectedTransaction.categoryId) ? t(getCategoryById(selectedTransaction.categoryId).labelKey) : '-') }}
                  </h2>
                  <span class="tx-detail__type-badge" :style="{ backgroundColor: getAmountColor(selectedTransaction.type) + '20', color: getAmountColor(selectedTransaction.type) }">
                    {{ getTypeInfo(selectedTransaction.type).label }}
                  </span>
                </div>
              </div>
              <button class="tx-detail__close" @click="closeDetail">
                <Icon name="material-symbols:close-rounded" size="24" />
              </button>
            </div>

            <!-- Amount -->
            <div class="tx-detail__amount-section">
              <span
                class="tx-detail__amount"
                :style="{ color: getAmountColor(selectedTransaction.type) }"
              >
                {{ getAmountPrefix(selectedTransaction.type) }}Rp{{ formatRupiah(selectedTransaction.amount) }}
              </span>
              <span v-if="selectedTransaction.type === 'debt' && selectedTransaction.totalDebt" class="tx-detail__amount-sub">
                {{ t('pages.finance.transactions.detail_amount') }}: Rp{{ formatRupiah(selectedTransaction.totalDebt) }}
              </span>
            </div>

            <!-- Description (only if available) -->
            <div v-if="selectedTransaction.description" class="tx-detail__section">
              <div class="tx-detail__section-title">
                <Icon name="material-symbols:notes-rounded" size="18" />
                {{ t('pages.finance.transactions.detail_description') }}
              </div>
              <p class="tx-detail__description">{{ selectedTransaction.description }}</p>
            </div>

            <!-- Category Info -->
            <div class="tx-detail__section">
              <div class="tx-detail__section-title">
                <Icon name="material-symbols:category-outline-rounded" size="18" />
                {{ t('pages.finance.transactions.detail_category') }}
              </div>
              <div class="tx-detail__row">
                <div class="tx-detail__row-left">
                  <div
                    class="tx-detail__mini-icon"
                    :style="{ backgroundColor: (getCategoryById(selectedTransaction.categoryId)?.color || '#888') + '20', color: getCategoryById(selectedTransaction.categoryId)?.color || '#888' }"
                  >
                    <Icon :name="getCategoryById(selectedTransaction.categoryId)?.icon || 'material-symbols:help-outline-rounded'" size="16" />
                  </div>
                  <span>{{ getCategoryById(selectedTransaction.categoryId) ? t(getCategoryById(selectedTransaction.categoryId).labelKey) : '-' }}</span>
                </div>
                <span class="tx-detail__row-badge">{{ getCategoryById(selectedTransaction.categoryId)?.type || selectedTransaction.type }}</span>
              </div>
            </div>

            <!-- Wallet Info -->
            <div class="tx-detail__section">
              <div class="tx-detail__section-title">
                <Icon name="material-symbols:wallet-outline-rounded" size="18" />
                {{ t('pages.finance.transactions.detail_wallet') }}
              </div>
              <div class="tx-detail__row">
                <div class="tx-detail__row-left">
                  <div class="tx-detail__mini-icon tx-detail__mini-icon--wallet">
                    <Icon name="material-symbols:account-balance-wallet-outline-rounded" size="16" />
                  </div>
                  <div>
                    <span class="tx-detail__row-label">{{ t('pages.finance.transactions.detail_wallet_from') }}</span>
                    <span class="tx-detail__row-value">{{ getWalletName(selectedTransaction.walletId) }}</span>
                  </div>
                </div>
              </div>
              <div v-if="selectedTransaction.toWalletId" class="tx-detail__row">
                <div class="tx-detail__row-left">
                  <div class="tx-detail__mini-icon tx-detail__mini-icon--wallet-to">
                    <Icon name="material-symbols:account-balance-wallet-outline-rounded" size="16" />
                  </div>
                  <div>
                    <span class="tx-detail__row-label">{{ t('pages.finance.transactions.detail_wallet_to') }}</span>
                    <span class="tx-detail__row-value">{{ getWalletName(selectedTransaction.toWalletId) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Time Info -->
            <div class="tx-detail__section">
              <div class="tx-detail__section-title">
                <Icon name="material-symbols:schedule-rounded" size="18" />
                {{ t('pages.finance.transactions.detail_time') }}
              </div>
              <div class="tx-detail__time-grid">
                <div class="tx-detail__time-item">
                  <span class="tx-detail__time-label">{{ t('pages.finance.transactions.detail_day') }}</span>
                  <span class="tx-detail__time-value">{{ formatDayName(selectedTransaction.createdAt) }}</span>
                </div>
                <div class="tx-detail__time-item">
                  <span class="tx-detail__time-label">{{ t('pages.finance.transactions.detail_date') }}</span>
                  <span class="tx-detail__time-value">{{ formatDateShort(selectedTransaction.createdAt) }}</span>
                </div>
                <div class="tx-detail__time-item">
                  <span class="tx-detail__time-label">{{ t('pages.finance.transactions.detail_time_of_day') }}</span>
                  <span class="tx-detail__time-value">{{ formatTime(selectedTransaction.createdAt) }}</span>
                </div>
              </div>
            </div>

            <!-- Debt Info (only for debt type) -->
            <div v-if="selectedTransaction.type === 'debt'" class="tx-detail__section">
              <div class="tx-detail__section-title">
                <Icon name="material-symbols:handshake-outline-rounded" size="18" />
                {{ t('pages.finance.transactions.detail_debt') }}
              </div>
              <div v-if="selectedTransaction.finePercent" class="tx-detail__row">
                <span class="tx-detail__row-label">{{ t('pages.finance.transactions.detail_fine_percent') }}</span>
                <span class="tx-detail__row-value tx-detail__row-value--fine">{{ selectedTransaction.finePercent }}%</span>
              </div>
              <div class="tx-detail__row">
                <span class="tx-detail__row-label">{{ t('pages.finance.transactions.detail_payment_status') }}</span>
                <span
                  class="tx-detail__status-badge"
                  :class="selectedTransaction.isPaid ? 'tx-detail__status-badge--paid' : 'tx-detail__status-badge--unpaid'"
                >
                  <Icon :name="selectedTransaction.isPaid ? 'material-symbols:check-circle-rounded' : 'material-symbols:pending-rounded'" size="14" />
                  {{ selectedTransaction.isPaid ? t('pages.finance.transactions.detail_debt_paid') : t('pages.finance.transactions.detail_debt_unpaid') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useFinanceStore } from '~/composables/finance/useFinanceStore'
import { useFinanceCategories } from '~/composables/finance/useFinanceCategories'

/**
 * Finance Transactions Page
 * ========================
 * Pusat seluruh aktivitas keuangan pengguna.
 * Menampilkan histori transaksi dengan search, filter, sorting,
 * dan detail transaksi dalam modal/bottom sheet.
 */

const { t } = useI18n()
const { transactions, wallets, getWalletBalance } = useFinanceStore()
const { categories, getCategoryById } = useFinanceCategories()

// ========== STATE ==========
const isMounted = ref(false)
const hasError = ref(false)
const searchQuery = ref('')
const sortOrder = ref('newest')

// Filters
const filterCategory = ref('')
const filterWallet = ref('')
const filterType = ref('')
const filterDateFrom = ref('')
const filterDateTo = ref('')

// UI State
const activePopover = ref(null)
const selectedTransaction = ref(null)
const showDetail = ref(false)
const searchInputRef = ref(null)

// ========== TYPE MAP ==========
const typeOptions = computed(() => [
  { value: 'income', label: t('pages.finance.transactions.type_income'), icon: 'material-symbols:arrow-downward-rounded', color: 'var(--md-sys-color-primary)' },
  { value: 'expense', label: t('pages.finance.transactions.type_expense'), icon: 'material-symbols:arrow-upward-rounded', color: 'var(--md-sys-color-error)' },
  { value: 'transfer', label: t('pages.finance.transactions.type_transfer'), icon: 'material-symbols:swap-horiz-rounded', color: 'var(--md-sys-color-tertiary)' },
  { value: 'debt', label: t('pages.finance.transactions.type_debt'), icon: 'material-symbols:handshake-outline-rounded', color: '#f59e0b' },
])

// ========== HELPERS ==========
const formatRupiah = (n) => {
  if (!n && n !== 0) return '0'
  return new Intl.NumberFormat('id-ID').format(n)
}

const getWalletName = (id) => {
  if (!id) return '-'
  const w = wallets.value.find(w => w.id === id)
  return w ? w.name : '-'
}

const getAmountPrefix = (type) => {
  if (type === 'income') return '+'
  if (type === 'expense' || type === 'debt') return '-'
  return ''
}

const getAmountColor = (type) => {
  if (type === 'income') return 'var(--md-sys-color-primary)'
  if (type === 'expense') return 'var(--md-sys-color-error)'
  if (type === 'transfer') return 'var(--md-sys-color-tertiary)'
  if (type === 'debt') return '#f59e0b'
  return 'var(--md-sys-color-on-surface)'
}

const getTypeInfo = (type) => {
  return typeOptions.value.find(o => o.value === type) || typeOptions.value[0]
}

// ========== COMPUTED: FILTERED & SORTED ==========
const filteredTransactions = computed(() => {
  let result = [...(transactions.value || [])]

  // Search
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(tx => {
      const cat = getCategoryById(tx.categoryId)
      const catName = cat ? t(cat.labelKey).toLowerCase() : ''
      const desc = (tx.description || '').toLowerCase()
      const walletName = getWalletName(tx.walletId).toLowerCase()
      return catName.includes(q) || desc.includes(q) || walletName.includes(q)
    })
  }

  // Filter category
  if (filterCategory.value) {
    result = result.filter(tx => tx.categoryId === filterCategory.value)
  }

  // Filter wallet
  if (filterWallet.value) {
    result = result.filter(tx => tx.walletId === filterWallet.value || tx.toWalletId === filterWallet.value)
  }

  // Filter type
  if (filterType.value) {
    result = result.filter(tx => tx.type === filterType.value)
  }

  // Filter date range
  if (filterDateFrom.value) {
    const from = new Date(filterDateFrom.value)
    from.setHours(0, 0, 0, 0)
    result = result.filter(tx => new Date(tx.createdAt) >= from)
  }
  if (filterDateTo.value) {
    const to = new Date(filterDateTo.value)
    to.setHours(23, 59, 59, 999)
    result = result.filter(tx => new Date(tx.createdAt) <= to)
  }

  // Sort
  result.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return sortOrder.value === 'newest' ? dateB - dateA : dateA - dateB
  })

  return result
})

// ========== COMPUTED: SUMMARY ==========
const summaryData = computed(() => {
  const txs = filteredTransactions.value
  const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0)
  const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0)
  return {
    count: txs.length,
    totalIncome,
    totalExpense,
  }
})

// ========== COMPUTED: GROUPED BY DATE ==========
const groupedTransactions = computed(() => {
  const txs = filteredTransactions.value
  if (!txs.length) return []

  const groups = {}
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  txs.forEach(tx => {
    const d = new Date(tx.createdAt)
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    let key

    if (dayStart.getTime() === today.getTime()) {
      key = '__today__'
    } else if (dayStart.getTime() === yesterday.getTime()) {
      key = '__yesterday__'
    } else {
      key = dayStart.toISOString().split('T')[0]
    }

    if (!groups[key]) groups[key] = []
    groups[key].push(tx)
  })

  return Object.entries(groups).map(([key, items]) => {
    let label
    if (key === '__today__') {
      label = t('pages.finance.transactions.today')
    } else if (key === '__yesterday__') {
      label = t('pages.finance.transactions.yesterday')
    } else {
      const d = new Date(key + 'T00:00:00')
      label = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    }
    return { key, label, items }
  })
})

// ========== COMPUTED: ACTIVE FILTER COUNT ==========
const activeFilterCount = computed(() => {
  let count = 0
  if (filterCategory.value) count++
  if (filterWallet.value) count++
  if (filterType.value) count++
  if (filterDateFrom.value || filterDateTo.value) count++
  return count
})

// ========== COMPUTED: ACTIVE FILTER CHIPS ==========
const activeFilterChips = computed(() => {
  const chips = []
  if (filterCategory.value) {
    const cat = getCategoryById(filterCategory.value)
    chips.push({ id: 'category', label: cat ? t(cat.labelKey) : filterCategory.value, color: cat?.color })
  }
  if (filterWallet.value) {
    chips.push({ id: 'wallet', label: getWalletName(filterWallet.value) })
  }
  if (filterType.value) {
    const info = getTypeInfo(filterType.value)
    chips.push({ id: 'type', label: info.label, color: info.color })
  }
  if (filterDateFrom.value || filterDateTo.value) {
    const from = filterDateFrom.value || '...'
    const to = filterDateTo.value || '...'
    chips.push({ id: 'date', label: `${from} — ${to}` })
  }
  return chips
})

// ========== METHODS ==========
const togglePopover = (name) => {
  activePopover.value = activePopover.value === name ? null : name
}

const closePopover = () => {
  activePopover.value = null
}

const selectCategory = (id) => {
  filterCategory.value = filterCategory.value === id ? '' : id
  closePopover()
}

const selectWallet = (id) => {
  filterWallet.value = filterWallet.value === id ? '' : id
  closePopover()
}

const selectType = (type) => {
  filterType.value = filterType.value === type ? '' : type
  closePopover()
}

const toggleSort = () => {
  sortOrder.value = sortOrder.value === 'newest' ? 'oldest' : 'newest'
}

const resetFilters = () => {
  filterCategory.value = ''
  filterWallet.value = ''
  filterType.value = ''
  filterDateFrom.value = ''
  filterDateTo.value = ''
  searchQuery.value = ''
}

const removeChip = (chipId) => {
  if (chipId === 'category') filterCategory.value = ''
  if (chipId === 'wallet') filterWallet.value = ''
  if (chipId === 'type') filterType.value = ''
  if (chipId === 'date') { filterDateFrom.value = ''; filterDateTo.value = '' }
}

const openDetail = (tx) => {
  selectedTransaction.value = tx
  showDetail.value = true
}

const closeDetail = () => {
  showDetail.value = false
  setTimeout(() => { selectedTransaction.value = null }, 300)
}

const formatTime = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const formatFullDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

const formatDayName = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { weekday: 'long' })
}

const formatDateShort = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const retryLoad = () => {
  hasError.value = false
  isMounted.value = false
  setTimeout(() => { isMounted.value = true }, 800)
}

// ========== LIFECYCLE ==========
onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      isMounted.value = true
    }, 600)
  })
})

// Close popover on escape
onMounted(() => {
  const handler = (e) => {
    if (e.key === 'Escape') {
      closePopover()
      if (showDetail.value) closeDetail()
    }
  }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})
</script>

<style scoped>
/* ============================================ */
/* PAGE ROOT                                    */
/* ============================================ */
.tx-page {
  min-height: 100vh;
  padding: 24px 16px 120px;
  max-width: 720px;
  margin: 0 auto;
  color: var(--md-sys-color-on-surface);
  background-color: var(--md-sys-color-surface);
  display: flex;
  flex-direction: column;
  gap: 16px;
  -webkit-font-smoothing: antialiased;
}

/* ============================================ */
/* HEADER                                       */
/* ============================================ */
.tx-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 4px;
  animation: txEnterUp 400ms cubic-bezier(0.05, 0.7, 0.1, 1) both;
}
.tx-header__title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--md-sys-color-on-surface);
  letter-spacing: -0.3px;
}
.tx-header__subtitle {
  margin: 0;
  font-size: 0.82rem;
  color: var(--md-sys-color-on-surface-variant);
  font-weight: 400;
}
.tx-header__count {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--md-sys-color-primary);
  background: color-mix(in srgb, var(--md-sys-color-primary) 10%, transparent);
  padding: 4px 12px;
  border-radius: 20px;
  align-self: flex-start;
  margin-top: 8px;
}

/* ============================================ */
/* SUMMARY CARDS                                */
/* ============================================ */
.tx-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  animation: txEnterUp 400ms cubic-bezier(0.05, 0.7, 0.1, 1) 60ms both;
}
.tx-summary__card {
  background: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 16px;
  padding: 14px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}
.tx-summary__card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}
.tx-summary__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tx-summary__icon--total { background: color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent); color: var(--md-sys-color-primary); }
.tx-summary__icon--income { background: color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent); color: var(--md-sys-color-primary); }
.tx-summary__icon--expense { background: color-mix(in srgb, var(--md-sys-color-error) 12%, transparent); color: var(--md-sys-color-error); }
.tx-summary__info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.tx-summary__label { font-size: 0.65rem; font-weight: 500; color: var(--md-sys-color-on-surface-variant); text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tx-summary__value { font-size: 0.85rem; font-weight: 700; color: var(--md-sys-color-on-surface); font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tx-summary__value--income { color: var(--md-sys-color-primary); }
.tx-summary__value--expense { color: var(--md-sys-color-error); }

/* ============================================ */
/* SEARCH                                       */
/* ============================================ */
.tx-search {
  position: relative;
  display: flex;
  align-items: center;
  animation: txEnterUp 400ms cubic-bezier(0.05, 0.7, 0.1, 1) 100ms both;
}
.tx-search__icon {
  position: absolute;
  left: 14px;
  color: var(--md-sys-color-on-surface-variant);
  pointer-events: none;
}
.tx-search__input {
  width: 100%;
  padding: 12px 40px 12px 42px;
  font-size: 0.9rem;
  background: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 14px;
  color: var(--md-sys-color-on-surface);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
  font-family: inherit;
}
.tx-search__input::placeholder { color: var(--md-sys-color-on-surface-variant); opacity: 0.6; }
.tx-search__input:focus {
  border-color: var(--md-sys-color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent);
}
.tx-search__clear {
  position: absolute;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}
.tx-search__clear:hover { background: var(--md-sys-color-outline-variant); }

/* ============================================ */
/* FILTER BAR                                   */
/* ============================================ */
.tx-filters {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  animation: txEnterUp 400ms cubic-bezier(0.05, 0.7, 0.1, 1) 140ms both;
}
.tx-filters::-webkit-scrollbar { display: none; }

.tx-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  border-radius: 12px;
  border: 1px solid var(--md-sys-color-outline-variant);
  background: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
  font-family: inherit;
  flex-shrink: 0;
}
.tx-filter-btn:hover {
  background: var(--md-sys-color-surface-variant);
  border-color: var(--md-sys-color-outline);
}
.tx-filter-btn--active {
  background: color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent);
  border-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-primary);
}
.tx-filter-btn__arrow {
  transition: transform 0.2s ease;
}
.tx-filter-btn__arrow--open {
  transform: rotate(180deg);
}
.tx-filter-btn--sort {
  background: var(--md-sys-color-surface-container);
}
.tx-filter-btn--reset {
  padding: 8px 10px;
  background: color-mix(in srgb, var(--md-sys-color-error) 10%, transparent);
  border-color: color-mix(in srgb, var(--md-sys-color-error) 30%, transparent);
  color: var(--md-sys-color-error);
}
.tx-filter-btn--reset:hover {
  background: color-mix(in srgb, var(--md-sys-color-error) 20%, transparent);
}

/* ============================================ */
/* ACTIVE FILTER CHIPS                          */
/* ============================================ */
.tx-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tx-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px 5px 12px;
  background: var(--md-sys-color-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface-variant);
  animation: txChipIn 200ms ease both;
}
.tx-chip__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.tx-chip__label {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tx-chip__remove {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
  padding: 0;
}
.tx-chip__remove:hover {
  background: var(--md-sys-color-outline-variant);
}

/* ============================================ */
/* TRANSACTION GROUPS                           */
/* ============================================ */
.tx-groups {
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: txEnterUp 400ms cubic-bezier(0.05, 0.7, 0.1, 1) 180ms both;
}
.tx-group__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding-left: 4px;
}
.tx-group__label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface);
  letter-spacing: 0.2px;
}
.tx-group__count {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface-variant);
  background: var(--md-sys-color-surface-variant);
  padding: 2px 8px;
  border-radius: 10px;
}
.tx-group__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ============================================ */
/* TRANSACTION CARD                             */
/* ============================================ */
.tx-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--md-sys-color-surface-container);
  border: 1px solid transparent;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.18s ease;
  text-align: left;
  width: 100%;
  font-family: inherit;
  position: relative;
  overflow: hidden;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
.tx-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--md-sys-color-on-surface);
  opacity: 0;
  transition: opacity 0.15s ease;
  pointer-events: none;
  border-radius: inherit;
}
.tx-card:hover {
  background: var(--md-sys-color-surface-variant);
  border-color: var(--md-sys-color-outline-variant);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.tx-card:hover::after { opacity: 0.03; }
.tx-card:active {
  transform: scale(0.985);
  transition-duration: 80ms;
}
.tx-card:active::after { opacity: 0.06; }
.tx-card:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.tx-card__icon {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tx-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tx-card__top-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}
.tx-card__name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}
.tx-card__amount {
  font-size: 0.88rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  flex-shrink: 0;
}
.tx-card__bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.tx-card__meta {
  font-size: 0.72rem;
  color: var(--md-sys-color-on-surface-variant);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tx-card__meta-dot {
  margin: 0 3px;
  opacity: 0.5;
}
.tx-card__time {
  font-size: 0.7rem;
  color: var(--md-sys-color-on-surface-variant);
  opacity: 0.7;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ============================================ */
/* STATES (Empty / Error)                       */
/* ============================================ */
.tx-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
  animation: txEnterUp 400ms ease both;
}
.tx-state__icon-wrap {
  width: 88px;
  height: 88px;
  border-radius: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.tx-state__icon-wrap--empty {
  background: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-outline);
  opacity: 0.7;
}
.tx-state__icon-wrap--error {
  background: color-mix(in srgb, var(--md-sys-color-error) 12%, transparent);
  color: var(--md-sys-color-error);
}
.tx-state__title {
  margin: 0 0 8px;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface);
}
.tx-state__desc {
  margin: 0 0 24px;
  font-size: 0.85rem;
  color: var(--md-sys-color-on-surface-variant);
  max-width: 280px;
  line-height: 1.5;
}
.tx-state__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 14px;
  border: none;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}
.tx-state__btn--primary {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}
.tx-state__btn--primary:hover { opacity: 0.9; transform: translateY(-1px); }
.tx-state__btn--primary:active { transform: scale(0.96); }
.tx-state__btn--error {
  background: color-mix(in srgb, var(--md-sys-color-error) 12%, transparent);
  color: var(--md-sys-color-error);
}
.tx-state__btn--error:hover { background: color-mix(in srgb, var(--md-sys-color-error) 20%, transparent); }

/* ============================================ */
/* FILTER POPOVER                               */
/* ============================================ */
.tx-popover-overlay {
  position: fixed;
  inset: 0;
  z-index: 15000;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 180px;
  backdrop-filter: blur(2px);
}
.tx-popover {
  background: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
  width: 92%;
  max-width: 360px;
  max-height: 60vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: txPopoverIn 250ms cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
  overflow: hidden;
}
.tx-popover__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 12px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  flex-shrink: 0;
}
.tx-popover__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface);
}
.tx-popover__close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}
.tx-popover__close:hover { background: var(--md-sys-color-outline-variant); }
.tx-popover__body {
  padding: 8px;
  overflow-y: auto;
  flex: 1;
}
.tx-popover__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: var(--md-sys-color-on-surface);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
  font-family: inherit;
  text-align: left;
}
.tx-popover__option:hover { background: var(--md-sys-color-surface-variant); }
.tx-popover__option--active {
  background: color-mix(in srgb, var(--md-sys-color-primary) 10%, transparent);
  color: var(--md-sys-color-primary);
  font-weight: 600;
}
.tx-popover__option-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.tx-popover__option-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tx-popover__option-icon--wallet {
  background: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
}
.tx-popover__check {
  color: var(--md-sys-color-primary);
  flex-shrink: 0;
}

/* Date popover */
.tx-popover__body--date {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.tx-date-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tx-date-field__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.tx-date-field__input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--md-sys-color-outline-variant);
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font-size: 0.85rem;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}
.tx-date-field__input:focus {
  border-color: var(--md-sys-color-primary);
}
.tx-popover__actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}
.tx-popover__action-btn {
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  border: none;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}
.tx-popover__action-btn--clear {
  background: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
}
.tx-popover__action-btn--clear:hover { background: var(--md-sys-color-outline-variant); }
.tx-popover__action-btn--apply {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}
.tx-popover__action-btn--apply:hover { opacity: 0.9; }

/* ============================================ */
/* DETAIL MODAL                                 */
/* ============================================ */
.tx-detail-overlay {
  position: fixed;
  inset: 0;
  z-index: 20000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  backdrop-filter: blur(4px);
}
.tx-detail {
  background: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 28px 28px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 88vh;
  overflow-y: auto;
  padding: 8px 24px 36px;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.2);
  animation: txDetailSlideUp 350ms cubic-bezier(0.05, 0.7, 0.1, 1) both;
}
.tx-detail__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 0 12px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  margin-bottom: 16px;
}
.tx-detail__header-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}
.tx-detail__cat-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tx-detail__header-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1;
}
.tx-detail__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tx-detail__type-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 700;
  width: fit-content;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.tx-detail__close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s ease;
}
.tx-detail__close:hover { background: var(--md-sys-color-outline-variant); }

.tx-detail__amount-section {
  padding: 12px 0 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tx-detail__amount {
  font-size: 1.8rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.5px;
}
.tx-detail__amount-sub {
  font-size: 0.8rem;
  color: var(--md-sys-color-on-surface-variant);
}

.tx-detail__section {
  padding: 14px 0;
  border-top: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 50%, transparent);
}
.tx-detail__section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}
.tx-detail__description {
  margin: 0;
  font-size: 0.88rem;
  color: var(--md-sys-color-on-surface);
  line-height: 1.6;
}
.tx-detail__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}
.tx-detail__row-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}
.tx-detail__mini-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tx-detail__mini-icon--wallet {
  background: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
}
.tx-detail__mini-icon--wallet-to {
  background: color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent);
  color: var(--md-sys-color-primary);
}
.tx-detail__row-label {
  display: block;
  font-size: 0.72rem;
  color: var(--md-sys-color-on-surface-variant);
}
.tx-detail__row-value {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}
.tx-detail__row-value--fine {
  color: #f59e0b;
  font-weight: 700;
}
.tx-detail__row-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 8px;
  background: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  text-transform: capitalize;
  flex-shrink: 0;
}
.tx-detail__status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
}
.tx-detail__status-badge--paid {
  background: color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent);
  color: var(--md-sys-color-primary);
}
.tx-detail__status-badge--unpaid {
  background: color-mix(in srgb, #f59e0b 12%, transparent);
  color: #f59e0b;
}

.tx-detail__time-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.tx-detail__time-item {
  background: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tx-detail__time-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.tx-detail__time-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ============================================ */
/* ANIMATIONS                                   */
/* ============================================ */
@keyframes txEnterUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes txChipIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes txPopoverIn {
  from { opacity: 0; transform: scale(0.92) translateY(-10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes txDetailSlideUp {
  from { opacity: 0; transform: translateY(100%); }
  to { opacity: 1; transform: translateY(0); }
}

/* Transition classes */
.popover-fade-enter-active { transition: opacity 0.2s ease; }
.popover-fade-leave-active { transition: opacity 0.15s ease; }
.popover-fade-enter-from, .popover-fade-leave-to { opacity: 0; }

.detail-fade-enter-active { transition: opacity 0.25s ease; }
.detail-fade-leave-active { transition: opacity 0.2s ease; }
.detail-fade-enter-from, .detail-fade-leave-to { opacity: 0; }

.chips-fade-enter-active { transition: all 0.2s ease; }
.chips-fade-leave-active { transition: all 0.15s ease; }
.chips-fade-enter-from { opacity: 0; transform: translateY(-4px); }
.chips-fade-leave-to { opacity: 0; transform: scale(0.8); }

/* ============================================ */
/* RESPONSIVE                                   */
/* ============================================ */
@media (max-width: 640px) {
  .tx-page { padding: 16px 12px 110px; }
  .tx-header__title { font-size: 1.35rem; }

  /* ===== SUMMARY CARDS COMPACT ===== */
  .tx-summary {
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 6px !important;
  }
  .tx-summary__card {
    padding: 8px 6px !important;
    border-radius: 10px !important;
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
    gap: 4px !important;
  }
  .tx-summary__icon {
    width: 28px !important;
    height: 28px !important;
    border-radius: 8px !important;
  }
  .tx-summary__icon svg {
    width: 14px !important;
    height: 14px !important;
  }
  .tx-summary__label {
    font-size: 0.5rem !important;
    letter-spacing: 0.3px !important;
    white-space: nowrap;
  }
  .tx-summary__value {
    font-size: 0.7rem !important;
    line-height: 1.2;
  }
  .tx-summary__info {
    gap: 0 !important;
    align-items: center !important;
  }

  .tx-detail__time-grid { grid-template-columns: 1fr; }
  .tx-detail__amount { font-size: 1.5rem; }
}

@media (min-width: 641px) {
  .tx-detail-overlay {
    align-items: center;
  }
  .tx-detail {
    border-radius: 28px;
    max-height: 80vh;
    padding: 8px 28px 28px;
    animation-name: txDetailDialogIn;
  }
}

@keyframes txDetailDialogIn {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

@media (min-width: 1024px) {
  .tx-page { padding: 32px 24px 120px; }
}

/* ============================================ */
/* REDUCED MOTION                               */
/* ============================================ */
@media (prefers-reduced-motion: reduce) {
  .tx-card, .tx-summary__card, .tx-filter-btn, .tx-chip, .tx-state__btn {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
</style>