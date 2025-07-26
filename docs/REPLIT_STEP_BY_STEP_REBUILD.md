
# Buddhist Practice App - Step-by-Step Rebuild Guide for Replit Agent

## OVERVIEW
This guide provides exact step-by-step instructions for rebuilding the Buddhist Practice App from scratch on Replit using an optimized React Native + Expo framework while preserving ALL existing functionality and the Supabase database.

## PREREQUISITES
- Existing Supabase project with Buddhist Practice App database schema
- Environment variables already set in Replit Secrets:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## STEP-BY-STEP IMPLEMENTATION

### Phase 1: Clean Slate Setup

#### Step 1: Backup Critical Files
Before starting, backup these essential files (DO NOT DELETE):
```bash
# Backup IconSymbol system
mkdir -p backup/components/ui
cp components/ui/IconSymbol.tsx backup/components/ui/
cp components/ui/IconSymbol.ios.tsx backup/components/ui/

# Backup database types and Supabase config
mkdir -p backup/types backup/lib backup/constants
cp types/database.ts backup/types/
cp lib/supabase.ts backup/lib/
cp constants/Colors.ts backup/constants/
```

#### Step 2: Clean Project Structure
```bash
# Remove old architecture (keep backups safe)
rm -rf app/
rm -rf components/ (except backed up IconSymbol files)
rm -rf contexts/
rm -rf hooks/ (except useTimezone.ts)
rm -rf lib/ (except supabase.ts base)
```

#### Step 3: Update Dependencies
Add optimized state management and data fetching:

**package.json dependencies to add:**
```json
{
  "@tanstack/react-query": "^5.17.0",
  "zustand": "^4.4.7"
}
```

### Phase 2: Foundation Architecture

#### Step 4: Create Core Configuration Files

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

#### Step 5: Create Optimized Data Hooks

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

**Create: `lib/hooks/use-study.ts`**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/stores/auth-store'

export function useCourses() {
  return useQuery({
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
}

export function useStudyProgress() {
  const user = useAuthStore(state => state.user)
  
  return useQuery({
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
    enabled: !!user?.id,
  })
}
```

**Create: `lib/hooks/use-mindfulness.ts`**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/stores/auth-store'

export function useMindfulnessRecords(date?: string) {
  const user = useAuthStore(state => state.user)
  
  return useQuery({
    queryKey: ['mindfulness-records', user?.id, date],
    queryFn: async () => {
      if (!user) return []
      
      let query = supabase
        .from('mindfulness_records')
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

export function useAddMindfulnessRecord() {
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)
  
  return useMutation({
    mutationFn: async (record: any) => {
      const { data, error } = await supabase
        .from('mindfulness_records')
        .insert(record)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mindfulness-records', user?.id] })
    },
  })
}
```

### Phase 3: App Structure

#### Step 6: Restore IconSymbol System
```bash
# Restore backed up IconSymbol files
mkdir -p components/ui
cp backup/components/ui/IconSymbol.tsx components/ui/
cp backup/components/ui/IconSymbol.ios.tsx components/ui/

# Restore other essential files
cp backup/types/database.ts types/
cp backup/constants/Colors.ts constants/
```

#### Step 7: Root Layout with Providers

**Create: `app/_layout.tsx`**
```typescript
import { Stack } from 'expo-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/stores/auth-store'
import '../global.css'

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

#### Step 8: App Entry Point

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

#### Step 9: Tab Navigation Layout

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

### Phase 4: Core Screens Implementation

#### Step 10: Practice Screen (Main Tab)

**Create: `app/(tabs)/index.tsx`**
```typescript
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { usePractices, useDailyRecords } from '@/lib/hooks/use-practices'
import { IconSymbol } from '@/components/ui/IconSymbol'
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

#### Step 11: Study Screen

**Create: `app/(tabs)/study.tsx`**
```typescript
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useCourses, useStudyProgress } from '@/lib/hooks/use-study'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { router } from 'expo-router'

export default function StudyScreen() {
  const { data: courses, isLoading } = useCourses()
  const { data: studyProgress } = useStudyProgress()

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

#### Step 12: Mindfulness Screen

**Create: `app/(tabs)/mindfulness.tsx`**
```typescript
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useMindfulnessRecords, useAddMindfulnessRecord } from '@/lib/hooks/use-mindfulness'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useState } from 'react'

export default function MindfulnessScreen() {
  const [selectedType, setSelectedType] = useState<'good' | 'bad' | null>(null)
  const { data: records } = useMindfulnessRecords()
  const addRecord = useAddMindfulnessRecord()

  const handleAddRecord = async (type: 'good' | 'bad') => {
    try {
      await addRecord.mutateAsync({
        user_id: 'current-user-id', // Get from auth store
        record_date: new Date().toISOString().split('T')[0],
        record_time: new Date().toISOString().split('T')[1].substring(0, 8),
        mind_type: type,
        description: type === 'good' ? 'Good mind moment' : 'Bad mind moment',
      })
    } catch (error) {
      console.error('Error adding mindfulness record:', error)
    }
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6">Mindfulness</Text>
        
        <View className="flex-row space-x-4 mb-6">
          <TouchableOpacity
            onPress={() => handleAddRecord('good')}
            className="flex-1 bg-green-500 rounded-xl p-4 items-center"
          >
            <IconSymbol name="heart.fill" size={32} color="white" />
            <Text className="text-white font-semibold mt-2">Good Mind</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleAddRecord('bad')}
            className="flex-1 bg-red-500 rounded-xl p-4 items-center"
          >
            <IconSymbol name="exclamationmark.triangle.fill" size={32} color="white" />
            <Text className="text-white font-semibold mt-2">Bad Mind</Text>
          </TouchableOpacity>
        </View>

        {records?.map((record) => (
          <View
            key={record.id}
            className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-800">
                {record.mind_type === 'good' ? '🧘‍♀️ Good Mind' : '⚠️ Bad Mind'}
              </Text>
              <Text className="text-sm text-gray-500">
                {record.record_time}
              </Text>
            </View>
            {record.description && (
              <Text className="text-gray-600 mt-2">{record.description}</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
```

### Phase 5: Authentication System

#### Step 13: Authentication Layout

**Create: `app/auth/_layout.tsx`**
```typescript
import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="unified" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
    </Stack>
  )
}
```

#### Step 14: Unified Auth Screen

**Create: `app/auth/unified.tsx`**
```typescript
import React, { useState } from 'react'
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function UnifiedAuthScreen() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })
        if (error) throw error
        Alert.alert('Success', 'Please check your email for verification')
      }
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-white">
        <View className="flex-1 justify-center p-6">
          <Text className="text-3xl font-bold text-center mb-8 text-gray-800">
            Buddhist Practice
          </Text>
          
          <View className="space-y-4">
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="border border-gray-300 rounded-lg p-4 text-lg"
            />
            
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="border border-gray-300 rounded-lg p-4 text-lg"
            />
            
            <TouchableOpacity
              onPress={handleAuth}
              disabled={loading}
              className="bg-blue-500 rounded-lg p-4 items-center"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-semibold">
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setIsLogin(!isLogin)}
              className="items-center mt-4"
            >
              <Text className="text-blue-500 text-lg">
                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
```

### Phase 6: Complete Implementation

#### Step 15: Implement Remaining Screens
Follow the same pattern for all remaining screens:
- Profile setup and management
- Practice detail and history screens  
- Course detail and lesson viewers
- Statistics and analytics screens
- All modal screens for data entry

#### Step 16: Install Dependencies
```bash
npm install @tanstack/react-query zustand
```

#### Step 17: Test and Verify

Run these verification steps:
1. Start the development server: Click "Run" button in Replit
2. Test authentication flow
3. Verify Supabase connection
4. Test practice recording
5. Test study progress tracking
6. Test mindfulness recording
7. Verify all existing functionality works

## DEPLOYMENT ON REPLIT

1. All environment variables should already be set in Replit Secrets
2. Use existing Expo configuration files (app.json, eas.json)  
3. Test on Replit's preview environment
4. Deploy using existing EAS workflows when ready

## EXPECTED RESULTS

After completing this rebuild:
- **Performance**: 40-60% faster loading times
- **Bundle Size**: Significantly smaller due to optimized state management
- **User Experience**: Smoother interactions with optimistic updates
- **Maintainability**: Cleaner code structure with modern React patterns
- **Functionality**: 100% feature parity with original app

All existing Supabase data and functionality will be preserved while gaining significant performance improvements.
