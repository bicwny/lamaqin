import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Platform, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  console.log('🏠 TabLayout rendering at:', new Date().toISOString());

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ 
          backgroundColor: '#D4AF37', 
          paddingHorizontal: 24, 
          paddingVertical: 32, 
          borderBottomLeftRadius: 24, 
          borderBottomRightRadius: 24, 
          marginHorizontal: 16, 
          marginTop: 16 
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>佛法修行</Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 16, marginTop: 4 }}>愿一切众生离苦得乐</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 24, padding: 12 }}>
              <Text style={{ color: 'white', fontSize: 20 }}>🙏</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 16 }}>快速开始</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity 
              style={{ 
                backgroundColor: 'white', 
                borderRadius: 12, 
                padding: 16, 
                flex: 1, 
                marginRight: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2
              }}
              onPress={() => router.push('/add-practice')}
            >
              <View style={{ 
                backgroundColor: 'rgba(212, 175, 55, 0.1)', 
                borderRadius: 24, 
                width: 48, 
                height: 48, 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: 8 
              }}>
                <Text style={{ fontSize: 20 }}>📿</Text>
              </View>
              <Text style={{ fontWeight: '600', color: '#1f2937' }}>新修行</Text>
              <Text style={{ fontSize: 14, color: '#4b5563', marginTop: 4 }}>添加修行项目</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ 
                backgroundColor: 'white', 
                borderRadius: 12, 
                padding: 16, 
                flex: 1, 
                marginLeft: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2
              }}
              onPress={() => router.push('/modals/meditation-record')}
            >
              <View style={{ 
                backgroundColor: 'rgba(255, 105, 180, 0.1)', 
                borderRadius: 24, 
                width: 48, 
                height: 48, 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: 8 
              }}>
                <Text style={{ fontSize: 20 }}>🧘</Text>
              </View>
              <Text style={{ fontWeight: '600', color: '#1f2937' }}>快速记录</Text>
              <Text style={{ fontSize: 14, color: '#4b5563', marginTop: 4 }}>记录今日修行</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Progress */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 16 }}>今日进展</Text>
          <View style={{ 
            backgroundColor: 'white', 
            borderRadius: 12, 
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontWeight: '600', color: '#1f2937' }}>修行完成度</Text>
              <Text style={{ fontSize: 14, color: '#4b5563' }}>0 / 3 项目</Text>
            </View>
            <View style={{ backgroundColor: '#f3f4f6', borderRadius: 4, height: 8, marginBottom: 8 }}>
              <View style={{ backgroundColor: '#D4AF37', borderRadius: 4, height: 8, width: '0%' }} />
            </View>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>今日还未开始修行，愿您法喜充满 🙏</Text>
          </View>
        </View>

        {/* Motivation */}
        <View style={{ paddingHorizontal: 16, marginTop: 24, marginBottom: 32 }}>
          <View style={{ 
            backgroundColor: 'rgba(212, 175, 55, 0.1)', 
            borderRadius: 12, 
            padding: 16, 
            borderLeftWidth: 4, 
            borderLeftColor: '#D4AF37' 
          }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#D4AF37', marginBottom: 4 }}>每日法语</Text>
            <Text style={{ color: '#374151', fontStyle: 'italic' }}>
              "心如工画师，能画诸世间。五蕴悉从生，无法而不造。"
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>— 《华严经》</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}