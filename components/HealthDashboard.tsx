
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, testConnection } from '@/lib/supabase';

interface HealthCheck {
  name: string;
  status: 'checking' | 'healthy' | 'error';
  message: string;
  details?: string;
}

export function HealthDashboard() {
  const { user, loading } = useAuth();
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const healthChecks = [
    {
      name: 'Authentication',
      check: async () => {
        if (loading) return { status: 'checking', message: 'Checking auth...' };
        if (!user) return { status: 'error', message: 'No user authenticated' };
        return { 
          status: 'healthy', 
          message: 'User authenticated', 
          details: user.email 
        };
      }
    },
    {
      name: 'Database Connection',
      check: async () => {
        try {
          const connected = await testConnection();
          return connected 
            ? { status: 'healthy', message: 'Database connected' }
            : { status: 'error', message: 'Database connection failed' };
        } catch (error: any) {
          return { status: 'error', message: 'Connection error', details: error.message };
        }
      }
    },
    {
      name: 'User Profile',
      check: async () => {
        if (!user?.id) return { status: 'error', message: 'No user ID' };
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) return { status: 'error', message: 'Profile fetch failed', details: error.message };
          return { status: 'healthy', message: 'Profile loaded', details: data?.dharma_name };
        } catch (error: any) {
          return { status: 'error', message: 'Profile error', details: error.message };
        }
      }
    },
    {
      name: 'Practices Data',
      check: async () => {
        if (!user?.id) return { status: 'error', message: 'No user ID' };
        try {
          const { data, error } = await supabase
            .from('practices')
            .select('count')
            .limit(1);
          
          if (error) return { status: 'error', message: 'Practices query failed' };
          return { status: 'healthy', message: `Practices table accessible` };
        } catch (error: any) {
          return { status: 'error', message: 'Practices error', details: error.message };
        }
      }
    },
    {
      name: 'Environment Variables',
      check: async () => {
        const hasUrl = !!process.env.EXPO_PUBLIC_SUPABASE_URL;
        const hasKey = !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!hasUrl || !hasKey) {
          return { 
            status: 'error', 
            message: 'Missing env vars',
            details: `URL: ${hasUrl}, Key: ${hasKey}`
          };
        }
        return { status: 'healthy', message: 'Environment configured' };
      }
    }
  ];

  const runHealthChecks = async () => {
    setIsRunning(true);
    setChecks(healthChecks.map(hc => ({ 
      name: hc.name, 
      status: 'checking', 
      message: 'Running...' 
    })));

    for (let i = 0; i < healthChecks.length; i++) {
      const healthCheck = healthChecks[i];
      try {
        const result = await healthCheck.check();
        setChecks(prev => prev.map((check, idx) => 
          idx === i ? { name: healthCheck.name, ...result } : check
        ));
      } catch (error: any) {
        setChecks(prev => prev.map((check, idx) => 
          idx === i ? { 
            name: healthCheck.name, 
            status: 'error', 
            message: 'Check failed',
            details: error.message 
          } : check
        ));
      }
      // Small delay between checks
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    setIsRunning(false);
  };

  useEffect(() => {
    runHealthChecks();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#4CAF50';
      case 'error': return '#F44336';
      default: return '#FF9800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'error': return '❌';
      default: return '🔄';
    }
  };

  const healthyCount = checks.filter(c => c.status === 'healthy').length;
  const totalChecks = checks.length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏥 App Health Dashboard</Text>
        <Text style={styles.summary}>
          {healthyCount}/{totalChecks} checks passing
        </Text>
        <TouchableOpacity 
          style={[styles.button, isRunning && styles.buttonDisabled]} 
          onPress={runHealthChecks}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Running Checks...' : 'Run Health Checks'}
          </Text>
        </TouchableOpacity>
      </View>

      {checks.map((check, index) => (
        <View key={index} style={styles.checkItem}>
          <View style={styles.checkHeader}>
            <Text style={styles.checkName}>
              {getStatusIcon(check.status)} {check.name}
            </Text>
            <Text style={[styles.checkStatus, { color: getStatusColor(check.status) }]}>
              {check.status.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.checkMessage}>{check.message}</Text>
          {check.details && (
            <Text style={styles.checkDetails}>{check.details}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summary: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  checkItem: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  checkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  checkDetails: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});
