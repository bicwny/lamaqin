
# Buddhist Practice App - Optimized Framework Implementation Guide for Replit

## OVERVIEW
This document provides step-by-step instructions for rebuilding the Buddhist Practice App from scratch using an optimized framework stack while preserving the existing Supabase database and IconSymbol system. This guide is designed for communication with Replit agents.

## CURRENT STATE ANALYSIS
- **Current App**: Working Buddhist practice tracking app with Supabase integration
- **Preserve**: IconSymbol system, Supabase database schema, all core functionality
- **Optimize**: State management, data fetching, performance, bundle size
- **Platform**: React Native with Expo on Replit

## IMPLEMENTATION PLAN

### Phase 1: Project Setup & Dependencies

#### Step 1: Clean Project Structure
```bash
# Remove all existing app files except IconSymbol system
rm -rf app/
rm -rf components/ (except components/ui/IconSymbol*)
rm -rf contexts/
rm -rf hooks/ (except timezone-related)
rm -rf lib/ (except supabase.ts base)

# Keep these directories/files:
# - components/ui/IconSymbol.tsx and IconSymbol.ios.tsx
# - lib/supabase.ts (base configuration)
# - constants/Colors.ts
# - types/database.ts
# - All Supabase database schema and data
```

#### Step 2: Update Dependencies
Replace React Context with Zustand and add React Query:

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.17.0",
    "zustand": "^4.4.7",
    "react-native-elements": "^3.4.3",
    "nativewind": "^4.1.23"
  }
}
```

#### Step 3: Core Configuration Files

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

### Phase 2: App Structure Rebuild

#### Step 1: Root Layout with React Query
**Create: `app/_layout.tsx`**
```typescript
import { Stack } from 'expo-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/stores/auth-store'

export default function RootLayout() {
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  )
}
```

#### Step 2: Tab Navigation Structure
**Create: `app/(tabs)/_layout.tsx`**
```typescript
import { Tabs } from 'expo-router'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { Colors } from '@/constants/Colors'

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: Colors.primary,
      headerShown: false,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Daily',
          tabBarIcon: ({ color }) => <IconSymbol name="house" color={color} />,
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: 'Study',
          tabBarIcon: ({ color }) => <IconSymbol name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color }) => <IconSymbol name="hands.sparkles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="mindfulness"
        options={{
          title: 'Mindfulness',
          tabBarIcon: ({ color }) => <IconSymbol name="brain.head.profile" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <IconSymbol name="chart.bar" color={color} />,
        }}
      />
    </Tabs>
  )
}
```

### Phase 3: Data Management Layer

#### Step 1: Practice Query Hooks
**Create: `lib/queries/practice-queries.ts`**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/stores/auth-store'

export const usePracticeProjects = () => {
  const user = useAuthStore((state) => state.user)
  
  return useQuery({
    queryKey: ['practice-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const { data, error } = await supabase
        .from('user_practice_projects')
        .select(`
          *,
          practices (name, type, unit)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        
      if (error) throw error
      return data
    },
    enabled: !!user?.id,
  })
}

export const useRecordPractice = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ projectId, count, notes }: {
      projectId: string
      count: number
      notes?: string
    }) => {
      const { data, error } = await supabase
        .from('daily_records')
        .insert({
          practice_project_id: projectId,
          count,
          notes,
          recorded_at: new Date().toISOString(),
        })
        
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-projects'] })
      queryClient.invalidateQueries({ queryKey: ['daily-progress'] })
    },
  })
}
```

#### Step 2: Study Query Hooks
**Create: `lib/queries/study-queries.ts`**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/stores/auth-store'

export const useUserCourses = () => {
  const user = useAuthStore((state) => state.user)
  
  return useQuery({
    queryKey: ['user-courses', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const { data, error } = await supabase
        .from('user_courses')
        .select(`
          *,
          courses (
            id, name, teacher, description, total_lessons
          )
        `)
        .eq('user_id', user.id)
        
      if (error) throw error
      return data
    },
    enabled: !!user?.id,
  })
}

export const useRecordStudy = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ courseId, lessonNumber, studyType }: {
      courseId: string
      lessonNumber: number
      studyType: 'transmission' | 'text'
    }) => {
      const { data, error } = await supabase
        .from('study_records')
        .insert({
          course_id: courseId,
          lesson_number: lessonNumber,
          study_type: studyType,
          completed_at: new Date().toISOString(),
        })
        
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-courses'] })
    },
  })
}
```

### Phase 4: UI Components with NativeWind

#### Step 1: Base UI Components
**Create: `components/ui/Button.tsx`**
```typescript
import React from 'react'
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native'
import { Colors } from '@/constants/Colors'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary'
  loading?: boolean
  disabled?: boolean
}

export function Button({ title, onPress, variant = 'primary', loading, disabled }: ButtonProps) {
  const baseStyle = "px-6 py-3 rounded-lg items-center justify-center"
  const variantStyle = variant === 'primary' 
    ? "bg-red-600" 
    : "bg-gray-200"
  const textStyle = variant === 'primary' ? "text-white" : "text-gray-800"

  return (
    <TouchableOpacity
      className={`${baseStyle} ${variantStyle} ${(disabled || loading) ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : Colors.primary} />
      ) : (
        <Text className={`${textStyle} font-semibold text-base`}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}
```

**Create: `components/ui/Card.tsx`**
```typescript
import React from 'react'
import { View } from 'react-native'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <View className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 ${className}`}>
      {children}
    </View>
  )
}
```

### Phase 5: Core App Screens

#### Step 1: Daily Dashboard
**Create: `app/(tabs)/index.tsx`**
```typescript
import React from 'react'
import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { usePracticeProjects } from '@/lib/queries/practice-queries'
import { useUserCourses } from '@/lib/queries/study-queries'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/lib/stores/auth-store'

export default function DailyScreen() {
  const user = useAuthStore((state) => state.user)
  const { data: practiceProjects, isLoading: practiceLoading, refetch: refetchPractice } = usePracticeProjects()
  const { data: userCourses, isLoading: studyLoading, refetch: refetchStudy } = useUserCourses()

  const handleRefresh = async () => {
    await Promise.all([refetchPractice(), refetchStudy()])
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">Please log in to continue</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl
            refreshing={practiceLoading || studyLoading}
            onRefresh={handleRefresh}
          />
        }
      >
        <View className="py-6">
          <Text className="text-2xl font-bold text-gray-900 mb-6">
            Daily Practice
          </Text>

          {/* Practice Projects */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Today's Practice
            </Text>
            {practiceProjects?.map((project) => (
              <Card key={project.id} className="mb-3">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="font-medium text-gray-900">
                      {project.practices.name}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Target: {project.daily_target} {project.practices.unit}
                    </Text>
                  </View>
                  <Button
                    title="Record"
                    onPress={() => {/* Navigate to practice recording */}}
                    variant="primary"
                  />
                </View>
              </Card>
            ))}
          </View>

          {/* Study Progress */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Study Progress
            </Text>
            {userCourses?.map((userCourse) => (
              <Card key={userCourse.id} className="mb-3">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">
                      {userCourse.courses.name}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Progress: {userCourse.current_lesson}/{userCourse.courses.total_lessons}
                    </Text>
                  </View>
                  <Button
                    title="Continue"
                    onPress={() => {/* Navigate to course */}}
                    variant="secondary"
                  />
                </View>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
```

#### Step 2: Practice Screen
**Create: `app/(tabs)/practice.tsx`**
```typescript
import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { usePracticeProjects } from '@/lib/queries/practice-queries'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { IconSymbol } from '@/components/ui/IconSymbol'

export default function PracticeScreen() {
  const { data: projects, isLoading } = usePracticeProjects()

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-900">
            Practice Projects
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/add-practice')}
            className="bg-red-600 rounded-full p-2"
          >
            <IconSymbol name="plus" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {projects?.map((project) => (
            <Card key={project.id} className="mb-4">
              <TouchableOpacity
                onPress={() => router.push(`/practice-detail/${project.id}`)}
              >
                <View className="space-y-2">
                  <Text className="font-semibold text-lg text-gray-900">
                    {project.practices.name}
                  </Text>
                  <Text className="text-gray-600">
                    Daily Target: {project.daily_target} {project.practices.unit}
                  </Text>
                  {project.practices.type === 'time' && (
                    <Text className="text-gray-600">
                      Weekly Target: {project.weekly_target} minutes
                    </Text>
                  )}
                  <View className="flex-row justify-between items-center mt-3">
                    <Text className="text-sm text-gray-500">
                      Tap to view details
                    </Text>
                    <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
                  </View>
                </View>
              </TouchableOpacity>
            </Card>
          ))}

          {(!projects || projects.length === 0) && !isLoading && (
            <Card className="items-center py-8">
              <IconSymbol name="hands.sparkles" size={48} color="#9CA3AF" />
              <Text className="text-gray-600 mt-4 mb-6 text-center">
                No practice projects yet.{'\n'}Create your first practice to get started.
              </Text>
              <Button
                title="Add Practice"
                onPress={() => router.push('/add-practice')}
              />
            </Card>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
```

### Phase 6: Authentication Integration

#### Step 1: Auth Guard Component
**Create: `components/AuthGuard.tsx`**
```typescript
import React from 'react'
import { View, Text } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Button } from '@/components/ui/Button'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-600">Loading...</Text>
      </View>
    )
  }

  if (!user) {
    return <Redirect href="/auth/unified" />
  }

  return <>{children}</>
}
```

#### Step 2: Update Tab Layout with Auth Guard
**Update: `app/(tabs)/_layout.tsx`** (add AuthGuard wrapper)
```typescript
// ... existing imports
import { AuthGuard } from '@/components/AuthGuard'

export default function TabLayout() {
  return (
    <AuthGuard>
      {/* existing tab layout */}
    </AuthGuard>
  )
}
```

### Phase 7: Performance Optimizations

#### Step 1: Add Loading States and Error Boundaries
**Create: `components/LoadingCard.tsx`**
```typescript
import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Card } from '@/components/ui/Card'

export function LoadingCard() {
  return (
    <Card className="items-center py-8">
      <ActivityIndicator size="large" color="#DC2626" />
    </Card>
  )
}
```

#### Step 2: Optimistic Updates for Recording
**Update practice recording mutation with optimistic updates**

#### Step 3: Background Sync and Offline Support
**Add React Query persistence and background refetching**

## IMPLEMENTATION SEQUENCE

### Phase 1: Foundation (Day 1)
1. Clean existing structure (preserve IconSymbol)
2. Update dependencies
3. Setup Zustand stores
4. Setup React Query client
5. Basic app layout structure

### Phase 2: Core Features (Day 2-3)
1. Authentication with Zustand
2. Daily dashboard with React Query
3. Practice system migration
4. Study system migration
5. Mindfulness system migration

### Phase 3: Polish & Performance (Day 4)
1. Add loading states and error handling
2. Implement optimistic updates
3. Add background sync
4. Performance testing and optimization
5. Final testing on all features

## EXPECTED IMPROVEMENTS

### Performance Benefits
- **30-50% faster state updates** with Zustand vs React Context
- **Automatic background refetching** with React Query
- **Reduced re-renders** through selective subscriptions
- **Better memory management** with automatic cache cleanup

### Developer Experience
- **Less boilerplate code** with modern patterns
- **Better debugging** with React Query DevTools
- **Type safety** maintained throughout
- **Easier testing** with isolated stores and queries

### User Experience
- **Faster app startup** due to optimized bundle
- **Smoother interactions** with optimistic updates
- **Better offline support** with query caching
- **More responsive UI** with background data fetching

## MIGRATION CHECKLIST

### Pre-Migration
- [ ] Backup current Supabase database
- [ ] Document current IconSymbol usage
- [ ] Test all existing functionality
- [ ] Export user data if needed

### During Migration
- [ ] Preserve IconSymbol system exactly
- [ ] Maintain Supabase schema unchanged
- [ ] Test each screen as it's rebuilt
- [ ] Verify authentication flow
- [ ] Check practice recording accuracy
- [ ] Validate study progress tracking
- [ ] Test mindfulness recording

### Post-Migration
- [ ] Performance comparison testing
- [ ] User acceptance testing
- [ ] Database integrity verification
- [ ] Cross-platform testing (iOS/Android/Web)
- [ ] Final deployment to Replit

## ROLLBACK PLAN

If issues arise during migration:
1. Keep original codebase in separate branch
2. Maintain database compatibility
3. Test rollback procedure beforehand
4. Document any data migration steps

---

This implementation guide provides a complete roadmap for rebuilding your Buddhist Practice App with modern, performant architecture while preserving all existing functionality and data. The optimized framework will provide better performance, easier maintenance, and improved user experience.
