<script setup lang="ts" generic="TData">
import {
  type ColumnDef,
  type SortingState,
  type PaginationState,
  FlexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'

interface Props {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  loading?: boolean
  pageSize?: number
  rowKey?: (row: TData, index: number) => string | number
  emptyTitle?: string
  emptyDescription?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pageSize: 10,
  emptyTitle: 'No results',
  emptyDescription: 'There are no records to display.',
})

const sorting = ref<SortingState>([])
const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: props.pageSize })

watch(() => props.pageSize, (size) => {
  pagination.value.pageSize = size
})

const table = useVueTable({
  get data() { return props.data },
  get columns() { return props.columns },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  state: {
    get sorting() { return sorting.value },
    get pagination() { return pagination.value },
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
  },
  onPaginationChange: (updater) => {
    pagination.value = typeof updater === 'function' ? updater(pagination.value) : updater
  },
})

const total = computed(() => props.data.length)
const pageStart = computed(() =>
  total.value === 0 ? 0 : pagination.value.pageIndex * pagination.value.pageSize + 1
)
const pageEnd = computed(() =>
  Math.min((pagination.value.pageIndex + 1) * pagination.value.pageSize, total.value)
)
</script>

<template>
  <div class="overflow-hidden rounded-lg bg-white shadow-sm">
    <TableSkeleton v-if="loading" :columns="columns.length" :rows="pageSize" />

    <div v-else-if="total === 0" class="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Icon name="lucide:inbox" class="h-6 w-6 text-gray-400" />
      </div>
      <h3 class="mb-1 text-base font-medium text-gray-900">{{ emptyTitle }}</h3>
      <p class="text-sm text-gray-500">{{ emptyDescription }}</p>
    </div>

    <template v-else>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
              <th
                v-for="header in headerGroup.headers"
                :key="header.id"
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                :style="header.column.columnDef.meta?.align === 'right' ? 'text-align:right' : ''"
              >
                <button
                  v-if="header.column.getCanSort()"
                  type="button"
                  class="inline-flex items-center gap-1 hover:text-gray-700"
                  @click="header.column.toggleSorting()"
                >
                  <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
                  <Icon
                    :name="
                      header.column.getIsSorted() === 'asc'
                        ? 'lucide:arrow-up'
                        : header.column.getIsSorted() === 'desc'
                          ? 'lucide:arrow-down'
                          : 'lucide:chevrons-up-down'
                    "
                    class="h-3.5 w-3.5"
                    :class="header.column.getIsSorted() ? 'text-gray-700' : 'text-gray-400'"
                  />
                </button>
                <FlexRender
                  v-else
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr
              v-for="(row, idx) in table.getRowModel().rows"
              :key="rowKey ? rowKey(row.original, idx) : row.id"
              class="hover:bg-gray-50"
            >
              <td
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                class="whitespace-nowrap px-6 py-4 text-sm text-gray-700"
                :style="cell.column.columnDef.meta?.align === 'right' ? 'text-align:right' : ''"
              >
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row sm:px-6">
        <p class="text-sm text-gray-700">
          Showing <span class="font-medium">{{ pageStart }}</span>
          to <span class="font-medium">{{ pageEnd }}</span>
          of <span class="font-medium">{{ total }}</span>
        </p>
        <div class="flex items-center gap-2">
          <label class="flex items-center gap-2 text-sm text-gray-600">
            <span class="hidden sm:inline">Rows</span>
            <select
              :value="pagination.pageSize"
              class="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label="Rows per page"
              @change="(e) => table.setPageSize(Number((e.target as HTMLSelectElement).value))"
            >
              <option v-for="n in [10, 25, 50, 100]" :key="n" :value="n">{{ n }}</option>
            </select>
          </label>
          <BaseButton
            variant="secondary"
            size="sm"
            :disabled="!table.getCanPreviousPage()"
            @click="table.previousPage()"
          >
            <Icon name="lucide:chevron-left" class="h-4 w-4" />
          </BaseButton>
          <span class="text-sm text-gray-700">
            Page {{ pagination.pageIndex + 1 }} of {{ Math.max(1, table.getPageCount()) }}
          </span>
          <BaseButton
            variant="secondary"
            size="sm"
            :disabled="!table.getCanNextPage()"
            @click="table.nextPage()"
          >
            <Icon name="lucide:chevron-right" class="h-4 w-4" />
          </BaseButton>
        </div>
      </div>
    </template>
  </div>
</template>
