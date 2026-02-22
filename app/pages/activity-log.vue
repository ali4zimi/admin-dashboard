<template>
  <div>
    <!-- Page header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p class="text-gray-600">View and filter all activity events in the system.</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div class="flex-1">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search activity logs..."
          class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @input="debouncedSearch"
        />
      </div>
      <div class="flex gap-2">
        <select
          v-model="filterAction"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @change="handleSearch"
        >
          <option>All Actions</option>
          <option value="user.create">User Created</option>
          <option value="user.update">User Updated</option>
          <option value="user.delete">User Deleted</option>
          <option value="post.create">Post Created</option>
          <option value="post.update">Post Updated</option>
          <option value="post.delete">Post Deleted</option>
          <option value="file.upload">File Uploaded</option>
          <option value="file.delete">File Deleted</option>
          <option value="auth.login">Login</option>
          <option value="auth.logout">Logout</option>
          <option value="auth.register">Register</option>
        </select>
        <select
          v-model="filterEntity"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @change="handleSearch"
        >
          <option>All Target Types</option>
          <option value="user">User</option>
          <option value="post">Post</option>
          <option value="file">File</option>
          <option value="auth">Auth</option>
        </select>
        <select
          v-model="filterStatus"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @change="handleSearch"
        >
          <option>All Status</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
          <option value="warning">Warning</option>
        </select>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center rounded-lg bg-white p-12 shadow-sm">
      <svg class="h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredLogs.length === 0" class="rounded-lg bg-white p-12 text-center shadow-sm">
      <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      </div>
      <h3 class="mb-1 text-lg font-medium text-gray-900">No activity logs found</h3>
      <p class="mb-4 text-sm text-gray-500">Try adjusting your filters or search.</p>
    </div>

    <!-- Activity logs table -->
    <div v-else class="overflow-hidden rounded-lg bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Timestamp</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Target Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Target ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Severity</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actor</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Message</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="log in filteredLogs" :key="log.id" class="hover:bg-gray-50">
              <td class="whitespace-nowrap px-6 py-4">{{ formatTimestamp(log.timestamp) }}</td>
              <td class="whitespace-nowrap px-6 py-4">{{ log.action }}</td>
              <td class="whitespace-nowrap px-6 py-4">{{ log.targetType || '-' }}</td>
              <td class="whitespace-nowrap px-6 py-4">{{ log.targetId || '-' }}</td>
              <td class="whitespace-nowrap px-6 py-4">
                <span :class="{
                  'text-green-600': log.status === 'success',
                  'text-red-600': log.status === 'error',
                  'text-yellow-600': log.status === 'warning',
                  'text-gray-600': !log.status
                }">{{ log.status || '-' }}</span>
              </td>
              <td class="whitespace-nowrap px-6 py-4">{{ log.severity || '-' }}</td>
              <td class="whitespace-nowrap px-6 py-4">
                <span v-if="log.actorId">
                  {{ log.actorId }}<span v-if="log.actorType"> ({{ log.actorType }})</span>
                </span>
                <span v-else>-</span>
              </td>
              <td class="whitespace-nowrap px-6 py-4">{{ log.message || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Results info -->
      <div class="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <p class="text-sm text-gray-700">
          Showing <span class="font-medium">{{ filteredLogs.length }}</span> activity logs
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { useFirebase } from '~/composables/useFirebase'

const logs = ref<any[]>([])
const loading = ref(true)
const { firestore } = useFirebase()

const searchTerm = ref('')
const filterAction = ref('All Actions')
const filterEntity = ref('All Target Types')
const filterStatus = ref('All Status')

const fetchLogs = async () => {
  if (!firestore) return
  loading.value = true
  try {
    const q = query(collection(firestore, 'activityLog'), orderBy('timestamp', 'desc'))
    const snapshot = await getDocs(q)
    logs.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (err) {
    logs.value = []
  } finally {
    loading.value = false
  }
}

let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handleSearch()
  }, 300)
}

const handleSearch = () => {
  // No-op, triggers computed filteredLogs
}

const filteredLogs = computed(() => {
  let result = logs.value
  // Filter by action
  if (filterAction.value !== 'All Actions') {
    result = result.filter(log => log.action === filterAction.value)
  }
  // Filter by target type
  if (filterEntity.value !== 'All Target Types') {
    result = result.filter(log => log.targetType === filterEntity.value)
  }
  // Filter by status
  if (filterStatus.value !== 'All Status') {
    result = result.filter(log => log.status === filterStatus.value)
  }
  // Search term
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    result = result.filter(log =>
      (log.message && log.message.toLowerCase().includes(term)) ||
      (log.action && log.action.toLowerCase().includes(term)) ||
      (log.targetType && log.targetType.toLowerCase().includes(term)) ||
      (log.targetId && log.targetId.toLowerCase().includes(term)) ||
      (log.actorId && log.actorId.toLowerCase().includes(term)) ||
      (log.severity && log.severity.toLowerCase().includes(term))
    )
  }
  return result
})

const formatTimestamp = (timestamp: any) => {
  if (!timestamp) return '-'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString()
}

onMounted(fetchLogs)
</script>

<style scoped>
.activity-log-page {
  max-width: 1100px;
  margin: 0 auto;
  background: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 32px 24px;
}
.page-header {
  margin-bottom: 24px;
}
.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 0;
}
.page-content {
  min-height: 300px;
}
.activity-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}
.activity-table th, .activity-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}
.activity-table th {
  background: #f3f4f6;
  font-weight: 600;
  color: #374151;
}
.activity-table tr:last-child td {
  border-bottom: none;
}
.activity-table tr:hover {
  background: #f9fafb;
}
</style>
