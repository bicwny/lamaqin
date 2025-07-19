
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

export function iPhone16CrashTest() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const isIPhone16 = Platform.OS === 'ios' && (
    Constants.deviceName?.includes('iPhone16') || 
    Constants.deviceName?.includes('iPhone 16') ||
    Constants.deviceName?.includes('iPhone17')
  );

  const runCrashTest = (testType: string) => {
    const timestamp = new Date().toLocaleTimeString();
    
    try {
      switch (testType) {
        case 'memory':
          // Simulate memory intensive operation
          const largeArray = new Array(1000000).fill('test');
          throw new Error(`iPhone 16 Memory Test - ${largeArray.length} items`);
          
        case 'navigation':
          // Simulate navigation crash
          throw new Error('iPhone 16 Navigation Crash Test');
          
        case 'rendering':
          // Simulate rendering issue
          throw new Error('iPhone 16 Rendering Crash Test');
          
        case 'async':
          // Simulate async operation crash
          Promise.reject(new Error('iPhone 16 Async Operation Crash'));
          break;

        case 'webview':
          // Simulate WebView specific crash (common on iPhone 16)
          throw new Error('iPhone 16 WebView Crash - Navigation Stack Overflow');

        case 'gesture':
          // Simulate gesture handling crash
          throw new Error('iPhone 16 Gesture Handling Crash - Touch Event Processing');

        case 'animation':
          // Simulate animation performance crash
          throw new Error('iPhone 16 Animation Crash - Rendering Pipeline Overload');
          
        default:
          throw new Error('iPhone 16 General Crash Test');
      }
    } catch (error) {
      console.log(`🧪 iPhone 16 ${testType} crash test triggered`);
      
      Sentry.withScope(scope => {
        scope.setTag('test_type', testType);
        scope.setTag('device_model', Constants.deviceName || 'unknown');
        scope.setTag('is_iphone16_test', true);
        scope.setLevel('error');
        scope.setContext('test_info', {
          testType,
          timestamp,
          deviceName: Constants.deviceName,
          platform: Platform.OS
        });
        Sentry.captureException(error);
      });
      
      setTestResults(prev => [...prev, `${timestamp}: ${testType} test completed`]);
    }
  };

  if (!isIPhone16) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>iPhone 16 测试</Text>
        <Text style={styles.subtitle}>
          当前设备: {Constants.deviceName || 'Unknown'}
        </Text>
        <Text style={styles.info}>此测试仅在 iPhone 16 上可用</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍎 iPhone 16 崩溃测试</Text>
      <Text style={styles.subtitle}>
        设备: {Constants.deviceName}
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.memoryButton]} 
          onPress={() => runCrashTest('memory')}
        >
          <Text style={styles.buttonText}>内存测试</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.navButton]} 
          onPress={() => runCrashTest('navigation')}
        >
          <Text style={styles.buttonText}>导航测试</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.renderButton]} 
          onPress={() => runCrashTest('rendering')}
        >
          <Text style={styles.buttonText}>渲染测试</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.asyncButton]} 
          onPress={() => runCrashTest('async')}
        >
          <Text style={styles.buttonText}>异步测试</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.webviewButton]} 
          onPress={() => runCrashTest('webview')}
        >
          <Text style={styles.buttonText}>WebView测试</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.gestureButton]} 
          onPress={() => runCrashTest('gesture')}
        >
          <Text style={styles.buttonText}>手势测试</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.animationButton]} 
          onPress={() => runCrashTest('animation')}
        >
          <Text style={styles.buttonText}>动画测试</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>测试结果:</Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>{result}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  info: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
    minWidth: 80,
  },
  memoryButton: {
    backgroundColor: '#ff6b6b',
  },
  navButton: {
    backgroundColor: '#4ecdc4',
  },
  renderButton: {
    backgroundColor: '#45b7d1',
  },
  asyncButton: {
    backgroundColor: '#96ceb4',
  },
  webviewButton: {
    backgroundColor: '#ffa726',
  },
  gestureButton: {
    backgroundColor: '#ab47bc',
  },
  animationButton: {
    backgroundColor: '#ef5350',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultsContainer: {
    marginTop: 10,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
});
