<template>
  <div>
    <PageHeader title="Dashboard" description="Welcome back! Here's an overview of your admin panel." class="mb-6" />

    <!-- Stats cards -->
    <div class="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-lg bg-white p-6 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">{{ stat.label }}</p>
            <p class="mt-1 text-3xl font-bold text-gray-900">{{ stat.value }}</p>
          </div>
          <div :class="['rounded-full p-3', stat.bg]">
            <Icon :name="stat.icon" :class="['h-6 w-6', stat.color]" />
          </div>
        </div>
      </div>
    </div>

    <!-- Recent activity and quick actions -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Recent Activity -->
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h2>
        <div v-if="recentActivity.length === 0" class="flex flex-col items-center justify-center py-8 text-center">
          <Icon name="lucide:activity" class="mb-2 h-8 w-8 text-gray-300" />
          <p class="text-sm text-gray-500">No recent activity yet.</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="entry in recentActivity"
            :key="entry.id"
            class="flex items-start space-x-3"
          >
            <div :class="['flex h-8 w-8 items-center justify-center rounded-full', entry.bg]">
              <Icon :name="entry.icon" :class="['h-4 w-4', entry.color]" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm text-gray-900">
                {{ entry.label }}
                <span class="font-medium">{{ entry.title }}</span>
              </p>
              <p class="text-xs text-gray-500">{{ formatRelative(entry.date) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div class="grid grid-cols-2 gap-4">
          <NuxtLink
            v-for="action in quickActions"
            :key="action.label"
            :to="action.to"
            :class="[
              'flex flex-col items-center rounded-lg border border-gray-200 p-4 transition-colors',
              action.hover,
            ]"
          >
            <div :class="['mb-2 rounded-full p-3', action.bg]">
              <Icon :name="action.icon" :class="['h-6 w-6', action.color]" />
            </div>
            <span class="text-sm font-medium text-gray-700">{{ action.label }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Dashboard - Admin Panel' })

const { users, fetchUsers } = useUsers()
const { posts, fetchPosts } = usePosts()
const { files, fetchFiles, storageStats } = useFiles()

const storageUsed = computed(() => {
  const s = storageStats.value
  if (!s) return '0 GB'
  const total =
    (s.images?.size ?? 0) +
    (s.documents?.size ?? 0) +
    (s.videos?.size ?? 0) +
    (s.others?.size ?? 0)
  return (total / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
})

const stats = computed(() => [
  { label: 'Total Users', value: users.value.length, icon: 'lucide:users', bg: 'bg-blue-100', color: 'text-blue-600' },
  { label: 'Total Posts', value: posts.value.length, icon: 'lucide:file-text', bg: 'bg-green-100', color: 'text-green-600' },
  { label: 'Total Files', value: files.value.length, icon: 'lucide:folder', bg: 'bg-purple-100', color: 'text-purple-600' },
  { label: 'Storage Used', value: storageUsed.value, icon: 'lucide:database', bg: 'bg-orange-100', color: 'text-orange-600' },
])

const quickActions = [
  { to: '/users', label: 'Manage Users', icon: 'lucide:user-plus', bg: 'bg-blue-100', color: 'text-blue-600', hover: 'hover:border-blue-500 hover:bg-blue-50' },
  { to: '/posts', label: 'New Post', icon: 'lucide:plus', bg: 'bg-green-100', color: 'text-green-600', hover: 'hover:border-green-500 hover:bg-green-50' },
  { to: '/files', label: 'Upload File', icon: 'lucide:upload', bg: 'bg-purple-100', color: 'text-purple-600', hover: 'hover:border-purple-500 hover:bg-purple-50' },
  { to: '/restaurant-settings', label: 'Settings', icon: 'lucide:settings', bg: 'bg-orange-100', color: 'text-orange-600', hover: 'hover:border-orange-500 hover:bg-orange-50' },
]

interface ActivityEntry {
  id: string
  label: string
  title: string
  icon: string
  bg: string
  color: string
  date: Date
}

const toDate = (value: unknown): Date | null => {
  if (!value) return null
  if (value instanceof Date) return value
  const v = value as { toDate?: () => Date }
  if (typeof v.toDate === 'function') return v.toDate()
  const d = new Date(value as string | number)
  return isNaN(d.getTime()) ? null : d
}

const recentActivity = computed<ActivityEntry[]>(() => {
  const entries: ActivityEntry[] = []

  for (const u of users.value) {
    const d = toDate(u.createdAt)
    if (!d) continue
    entries.push({
      id: `user-${u.id}`,
      label: 'New user',
      title: u.displayName || u.email || 'Unknown',
      icon: 'lucide:user-plus',
      bg: 'bg-blue-100',
      color: 'text-blue-600',
      date: d,
    })
  }

  for (const p of posts.value) {
    const d = toDate(p.date ?? p.createdAt)
    if (!d) continue
    entries.push({
      id: `post-${p.id}`,
      label: `Post (${p.status})`,
      title: p.title,
      icon: 'lucide:file-text',
      bg: 'bg-green-100',
      color: 'text-green-600',
      date: d,
    })
  }

  for (const f of files.value) {
    const d = toDate((f as any).createdAt ?? (f as any).updatedAt)
    if (!d) continue
    entries.push({
      id: `file-${(f as any).id ?? (f as any).name}`,
      label: 'File uploaded',
      title: (f as any).name || 'Unnamed file',
      icon: 'lucide:upload',
      bg: 'bg-purple-100',
      color: 'text-purple-600',
      date: d,
    })
  }

  return entries.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6)
})

const formatRelative = (date: Date): string => {
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(() => {
  fetchUsers()
  fetchPosts()
  fetchFiles('uploads')
})
</script>
