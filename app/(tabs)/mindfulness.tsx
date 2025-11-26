
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import { Colors } from '@/constants/Colors';
import PageTemplate from '@/components/PageTemplate';
import { ComponentTokens } from '@/utils/componentTokens';

const fawangImage = require('@/assets/images/fawang-thangka.png');

export default function MindfulnessScreen() {
  return (
    <PageTemplate
      title="心性" 
      subtitle="上师瑜伽·速赐加持"
      scrollable={false}
      backgroundColor={Colors.background}
      padding={0}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Image 
          source={fawangImage}
          style={styles.thangkaImage}
          resizeMode="contain"
        />

        <View style={styles.prayerHeader}>
          <Text style={styles.tibetanTitle}>༄༅། །བླ་མའི་རྣལ་འབྱོར་བྱིན་རླབས་མྱུར་སྩོལ་བཞུགས་སོ། །</Text>
          <Text style={styles.chineseTitle}>上师瑜伽·速赐加持</Text>
        </View>

        <View style={styles.mantraSection}>
          <Text style={styles.mantra}>ཨ།</Text>
          <Text style={styles.mantraChina}>阿</Text>
        </View>

        <View style={styles.prayerContent}>
          <Text style={styles.prayerTibetan}>
            འཁོར་འདས་ཆོས་ཀུན་ཀ་དག་རིག་པའི་ངང༌། །{'\n'}
            རང་གདངས་མ་འགགས་ཡེ་ཤེས་འོད་ལྔའི་ཀློང༌། །{'\n'}
            ངོ་བོ་དཔལ་ལྡན་འཇམ་པའི་རྡོ་རྗེ་ལ། །{'\n'}
            རྣམ་པ་སྐྱབས་གཅིག་ཡིད་བཞིན་ནོར་བུ་ཉིད། །{'\n'}
            དཀར་གསལ་མཛེས་འཛུམ་པཎྜི་ཏ་ཡི་ཆས། །{'\n'}
            ཆོས་འཆད་ཕྱག་རྒྱས་རལ་གྲི་གླེགས་བམ་བསྣམས། །{'\n'}
            ཞབས་གཉིས་སྐྱིལ་ཀྲུང་འོད་ཟེར་མུ་མེད་འཕྲོ། །{'\n'}
            རང་སྣང་དག་པའི་རྒྱན་དུ་ལམ་མེར་གསལ། །
          </Text>
          
          <Text style={styles.prayerChinese}>
            轮涅诸法本净觉性中{'\n'}
            自性不灭智慧五光界{'\n'}
            本体具德文殊金刚尊{'\n'}
            形相唯一怙主如意宝{'\n'}
            白明美颜班智达之饰{'\n'}
            说法手印持执宝剑函{'\n'}
            二足跏趺照射无边光{'\n'}
            一切自现观为净明然
          </Text>

          <Text style={styles.sectionTitle}>祈祷者：</Text>
          
          <Text style={styles.prayerTibetan}>
            གསོལ་བ་གདབ་པ་ནི།{'\n'}
            {'\n'}
            གནས་ཆེན་རི་བོ་རྩེ་ལྔའི་ཞིང་ཁམས་སུ། །{'\n'}
            འཇམ་དཔལ་ཐུགས་ཀྱི་བྱིན་རླབས་ཡིད་ལ་སྨིན། །{'\n'}
            འཇིགས་མེད་ཕུན་ཚོགས་ཞབས་ལ་གསོལ་བ་འདེབས། །{'\n'}
            དགོངས་བརྒྱུད་རྟོགས་པ་འཕོ་བར་བྱིན་གྱིས་རློབས། །
          </Text>

          <Text style={styles.prayerChinese}>
            祈祷词：{'\n'}
            {'\n'}
            自大圣境五台山{'\n'}
            文殊加持入心者{'\n'}
            祈祷晋美彭措足{'\n'}
            证悟意传求加持
          </Text>

          <Text style={styles.sectionTitle}>（随力念诵）</Text>

          <Text style={styles.prayerTibetan}>
            མཐར་ནི་བླ་མ་འོད་ལྔའི་ཐིག་ལེར་གྱུར།{'\n'}
            རང་གི་སྤྱི་བོ་ནས་ཞུགས་སྙིང་དབུས་ཐིམ། །{'\n'}
            རྒྱལ་ཀུན་ཡེ་ཤེས་གཅིག་འདུས་བླ་མ་དང༌། །{'\n'}
            སྐལ་བ་མཉམ་པའི་བྱིན་རླབས་ཐོབ་པར་བསམ། །
          </Text>

          <Text style={styles.prayerChinese}>
            后师已成五光之明点{'\n'}
            由从自顶渗入于心间{'\n'}
            当思诸佛智慧总集师{'\n'}
            获得于彼同份之加持
          </Text>

          <Text style={styles.prayerChinese} style={{ marginTop: 20, fontStyle: 'italic' }}>
            如是离意法身中入定，彼中起座时观诸现有即师本性，而行平常威仪也。
          </Text>

          <Text style={styles.colophon}>
            ཞེས་རབ་བྱུང་བཅུ་བདུན་པའི་ཤིང་ཕག་ཟླ ༦ ཚེས་ ༢༥ དུས་སུ་གངས་ལྗོངས་སྨྲ་བའི་དབང་ཕྱུག་སྤྲུལ་པའི་སྐུ་མཆོག་བསྟན་འཛིན་རྒྱ་མཚོས་རང་དང་སློབ་ཚོགས་ཡོངས་ལ་ཕན་པའི་ཕྱིར་དུ་འདི་འདྲ་ཞིག་དགོས་ཞེས་སྐུལ་མ་མཛད་པས་དེ་མ་ཐག་རིག་སྟོང་འཇམ་པའི་དབྱངས་ཀྱི་རང་སྒྲ་རྩོལ་མེད་དུ་ཤར་བ་བཞིན་མཁས་བཙུན་གྲུབ་པའི་དབང་ཕྱུག་སྤྲུལ་ལུང་རྟོགས་རྒྱ་མཚོས་ཡི་གེ་པ་བྱས་ཏེ་ངག་དབང་བློ་གྲོས་མཚུངས་མེད་ཀྱིས་མཁའ་དབྱིངས་འཇའ་སྤྲིན་འཁྱིལ་བའི་རི་ཁྲོད་ནས་སྤེལ་བ་དགེ། །།
          </Text>

          <Text style={styles.colophonChinese}>
            此文于十七胜生闰年木猪年六月二十五日，由雪域语自在化身丹增降措乞求曰：为利我等诸徒众之需，请造如是瑜伽。 如此劝求{'\n'}
            {'\n'}
            索达吉堪布 译
          </Text>
        </View>
      </ScrollView>
    </PageTemplate>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: DesignSystem.spacing.xl,
  },
  thangkaImage: {
    width: '100%',
    height: 300,
    marginBottom: DesignSystem.spacing.xl,
  },
  prayerHeader: {
    paddingHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
    alignItems: 'center',
  },
  tibetanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  chineseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DesignSystem.colors.primary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  mantraSection: {
    paddingHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
    alignItems: 'center',
  },
  mantra: {
    fontSize: 32,
    fontWeight: '700',
    color: DesignSystem.colors.primary,
    marginBottom: 8,
  },
  mantraChina: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  prayerContent: {
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  prayerTibetan: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  prayerChinese: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DesignSystem.colors.primary,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  colophon: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  colophonChinese: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
});
