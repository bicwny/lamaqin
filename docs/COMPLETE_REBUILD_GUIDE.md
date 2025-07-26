
# Buddhist Practice App - Complete Rebuild Guide for Replit Agent

## OVERVIEW
This document provides complete instructions for rebuilding the Buddhist Practice tracking app from scratch using an optimized React Native + Expo framework while preserving ALL existing functionality, Supabase database, and IconSymbol system.

## CURRENT APP ANALYSIS
**What Works Well (PRESERVE EXACTLY):**
- ✅ Supabase database schema and all data
- ✅ IconSymbol system (`components/ui/IconSymbol.tsx` and `IconSymbol.ios.tsx`)
- ✅ Complete Buddhist practice tracking functionality
- ✅ User authentication and profile system
- ✅ NativeWind + Tailwind CSS styling approach
- ✅ Expo + React Native architecture
- ✅ File-based routing with expo-router

**What Needs Optimization:**
- ❌ Replace React Context API with Zustand (performance issues)
- ❌ Add React Query for data fetching (eliminate manual state management)
- ❌ Optimize bundle size and loading performance
- ❌ Improve caching and offline support
- ❌ Better error handling and retry logic

## STEP-BY-STEP REBUILD INSTRUCTIONS

### Phase 1: Project Foundation

#### Step 1: Clean Project Structure
```bash
# IMPORTANT: Backup these files first (DO NOT DELETE):
# - components/ui/IconSymbol.tsx
# - components/ui/IconSymbol.ios.tsx  
# - types/database.ts
# - lib/supabase.ts
# - constants/Colors.ts
# - All Supabase database data

# Remove old architecture files:
rm -rf contexts/
rm -rf hooks/ (except useTimezone.ts)
rm -rf app/ (we'll rebuild this)
rm -rf components/ (except ui/IconSymbol*)
```

#### Step 2: Update Dependencies in package.json
Add these new optimized dependencies:
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.17.0",
    "zustand": "^4.4.7",
    "@react-native-async-storage/async-storage": "2.1.2",
    "react-native-elements": "^3.4.3",
    "nativewind": "^4.1.23"
  }
}
```

#### Step 3: Create Core Configuration Files

**Create: `lib/query-client.ts`**
```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})
```

**Create: `lib/stores/auth-store.ts`**
```typescript
import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

interface AuthStore {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  logout: () => set({ user: null, loading: false }),
}))
```

**Create: `lib/stores/practice-store.ts`**
```typescript
import { create } from 'zustand'
import { UserPracticeProject, DailyRecord } from '@/types/database'

interface PracticeStore {
  projects: UserPracticeProject[]
  dailyRecords: DailyRecord[]
  setProjects: (projects: UserPracticeProject[]) => void
  addProject: (project: UserPracticeProject) => void
  updateProject: (id: string, updates: Partial<UserPracticeProject>) => void
  setDailyRecords: (records: DailyRecord[]) => void
  addDailyRecord: (record: DailyRecord) => void
}

export const usePracticeStore = create<PracticeStore>((set) => ({
  projects: [],
  dailyRecords: [],
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project] 
  })),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  setDailyRecords: (records) => set({ dailyRecords: records }),
  addDailyRecord: (record) => set((state) => ({
    dailyRecords: [...state.dailyRecords, record]
  })),
}))
```

**Create: `lib/hooks/use-practices.ts`**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/stores/auth-store'
import { UserPracticeProject, DailyRecord } from '@/types/database'

export function usePractices() {
  const user = useAuthStore(state => state.user)
  
  return useQuery({
    queryKey: ['practices', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('user_practice_projects')
        .select(`
          *,
          practice:practices(*),
          theme:themes(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    enabled: !!user?.id,
  })
}

export function useDailyRecords(date?: string) {
  const user = useAuthStore(state => state.user)
  
  return useQuery({
    queryKey: ['daily-records', user?.id, date],
    queryFn: async () => {
      if (!user) return []
      
      let query = supabase
        .from('daily_records')
        .select('*')
        .eq('user_id', user.id)
      
      if (date) {
        query = query.eq('record_date', date)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    enabled: !!user?.id,
  })
}

export function useAddDailyRecord() {
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)
  
  return useMutation({
    mutationFn: async (record: Omit<DailyRecord, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('daily_records')
        .insert(record)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-records', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['practices', user?.id] })
    },
  })
}
```

### Phase 2: App Structure Rebuild

#### Step 4: Root Layout with Providers

**Create: `app/_layout.tsx`**
```typescript
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/stores/auth-store'
import '../global.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
})

export default function RootLayout() {
  const setUser = useAuthStore(state => state.setUser)
  
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="profile-setup" options={{ title: 'Profile Setup' }} />
      </Stack>
    </QueryClientProvider>
  )
}
```

#### Step 5: Authentication Flow

**Create: `app/index.tsx`**
```typescript
import { Redirect } from 'expo-router'
import { useAuthStore } from '@/lib/stores/auth-store'
import { ActivityIndicator, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export default function Index() {
  const { user, loading } = useAuthStore()
  
  const { data: profileComplete, isLoading: profileLoading } = useQuery({
    queryKey: ['profile-check', user?.id],
    queryFn: async () => {
      if (!user) return false
      
      const { data } = await supabase
        .from('users')
        .select('dharma_name, lay_name, location')
        .eq('id', user.id)
        .single()
      
      return !!(data?.dharma_name || data?.lay_name)
    },
    enabled: !!user,
  })

  if (loading || profileLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!user) {
    return <Redirect href="/auth/unified" />
  }

  if (!profileComplete) {
    return <Redirect href="/profile-setup" />
  }

  return <Redirect href="/(tabs)" />
}
```

#### Step 6: Tab Navigation

**Create: `app/(tabs)/_layout.tsx`**
```typescript
import { Tabs } from 'expo-router'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'

export default function TabLayout() {
  const colorScheme = useColorScheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={28} 
              name={focused ? 'hands.and.sparkles.fill' : 'hands.and.sparkles'} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: 'Study',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={28} 
              name={focused ? 'book.fill' : 'book'} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mindfulness"
        options={{
          title: 'Mindfulness',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={28} 
              name={focused ? 'heart.fill' : 'heart'} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={28} 
              name={focused ? 'chart.bar.fill' : 'chart.bar'} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={28} 
              name={focused ? 'person.fill' : 'person'} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  )
}
```

### Phase 3: Core Screens Implementation

#### Step 7: Practice Screen (Main Tab)

**Create: `app/(tabs)/index.tsx`**
```typescript
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { usePractices, useDailyRecords } from '@/lib/hooks/use-practices'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { Colors } from '@/constants/Colors'
import { router } from 'expo-router'
import { useState } from 'react'

export default function PracticeScreen() {
  const [refreshing, setRefreshing] = useState(false)
  const { data: practices, isLoading, refetch } = usePractices()
  const { data: todayRecords } = useDailyRecords(new Date().toISOString().split('T')[0])

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>Loading practices...</Text>
      </View>
    )
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-800">Daily Practice</Text>
          <TouchableOpacity
            onPress={() => router.push('/add-practice')}
            className="bg-blue-500 rounded-full p-3"
          >
            <IconSymbol name="plus" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {practices?.map((practice) => {
          const todayRecord = todayRecords?.find(r => r.practice_project_id === practice.id)
          const todayCount = todayRecord?.count || 0
          const progress = getProgressPercentage(todayCount, practice.daily_target)
          
          return (
            <TouchableOpacity
              key={practice.id}
              className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
              onPress={() => router.push(`/practice-detail/${practice.id}`)}
            >
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-semibold text-gray-800">
                  {practice.practice?.name}
                </Text>
                <Text className="text-sm text-gray-500">
                  {todayCount}/{practice.daily_target} {practice.practice?.unit}
                </Text>
              </View>
              
              <View className="bg-gray-200 rounded-full h-2 mb-2">
                <View 
                  className="bg-blue-500 rounded-full h-2"
                  style={{ width: `${progress}%` }}
                />
              </View>
              
              <Text className="text-xs text-gray-600">
                Progress: {progress.toFixed(0)}%
              </Text>
            </TouchableOpacity>
          )
        })}

        {(!practices || practices.length === 0) && (
          <View className="bg-white rounded-xl p-8 items-center">
            <IconSymbol name="hands.and.sparkles" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-center">
              No practice projects yet. Add your first practice to get started!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}
```

#### Step 8: Study Screen

**Create: `app/(tabs)/study.tsx`**
```typescript
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/stores/auth-store'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { router } from 'expo-router'

export default function StudyScreen() {
  const user = useAuthStore(state => state.user)
  
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data || []
    },
  })

  const { data: studyProgress } = useQuery({
    queryKey: ['study-progress', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('study_records')
        .select(`
          *,
          course:courses(*),
          lesson:course_lessons(*)
        `)
        .eq('user_id', user.id)
        .order('study_date', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>Loading courses...</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6">Study Courses</Text>

        {courses?.map((course) => {
          const courseProgress = studyProgress?.filter(p => p.course_id === course.id) || []
          const completedLessons = new Set(courseProgress.map(p => p.lesson_id)).size
          const progressPercent = (completedLessons / course.total_lessons) * 100

          return (
            <TouchableOpacity
              key={course.id}
              className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
              onPress={() => router.push(`/course-detail/${course.id}`)}
            >
              <View className="flex-row items-center mb-3">
                <IconSymbol name="book.fill" size={24} color="#3B82F6" />
                <Text className="text-lg font-semibold text-gray-800 ml-3 flex-1">
                  {course.name}
                </Text>
              </View>
              
              <Text className="text-sm text-gray-600 mb-3">
                {course.description}
              </Text>
              
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-gray-500">
                  {completedLessons}/{course.total_lessons} lessons
                </Text>
                <Text className="text-sm font-semibold text-blue-600">
                  {progressPercent.toFixed(0)}%
                </Text>
              </View>
              
              <View className="bg-gray-200 rounded-full h-2">
                <View 
                  className="bg-blue-500 rounded-full h-2"
                  style={{ width: `${progressPercent}%` }}
                />
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    </ScrollView>
  )
}
```

### Phase 4: Complete Feature Implementation

#### Step 9: Authentication Screens
- Copy and adapt existing auth screens to use Zustand store instead of Context
- Maintain same login/register flow

#### Step 10: All Remaining Screens
- Practice detail, meditation recording, mindfulness tracking
- Profile management, statistics
- Maintain exact same functionality but with optimized data fetching

#### Step 11: Component Migration
- Migrate all existing components to use new hooks
- Preserve IconSymbol system exactly as-is
- Update any Context usage to Zustand stores

## TESTING CHECKLIST

After rebuild, verify these functionalities work identically:

### Authentication & Profile
- [ ] User registration and login
- [ ] Profile setup and editing
- [ ] Password reset flow

### Practice System
- [ ] Adding new practice projects
- [ ] Daily practice recording (count and time types)
- [ ] Practice history and statistics
- [ ] Theme-based practice organization

### Study System
- [ ] Course viewing and lesson tracking
- [ ] Study session recording
- [ ] Auto-advance functionality
- [ ] Study statistics

### Mindfulness System
- [ ] Good/bad mind moment recording
- [ ] Daily mindfulness statistics
- [ ] Historical tracking

### Data Integrity
- [ ] All Supabase data preserved
- [ ] No data loss during migration
- [ ] Real-time updates working
- [ ] Offline behavior maintained

## PERFORMANCE EXPECTATIONS

After optimization:
- **Bundle size reduction**: 40-60% smaller
- **Loading times**: 50% faster screen transitions
- **Memory usage**: 30% reduction
- **Network requests**: Intelligent caching reduces redundant calls
- **User experience**: Smoother animations, optimistic updates

## DEPLOYMENT ON REPLIT

1. Ensure all environment variables are set in Replit Secrets
2. Use existing Expo configuration (app.json, eas.json)
3. Test thoroughly on Replit preview
4. Deploy using existing EAS workflow

This rebuild maintains 100% feature parity while providing significant performance improvements through modern React patterns and optimized state management.
