
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
          <View style={styles.verseBlock}>
            <Text style={styles.prayerTibetan}>འཁོར་འདས་ཆོས་ཀུན་ཀ་དག་རིག་པའི་ངང༌། །</Text>
            <Text style={styles.phonetic}>科德曲更甲达如毕昂</Text>
            <Text style={styles.prayerChinese}>轮涅诸法本净觉性中</Text>
          </View>

          <View style={styles.verseBlock}>
            <Text style={styles.prayerTibetan}>རང་གདངས་མ་འགགས་ཡེ་ཤེས་འོད་ལྔའི་ཀློང༌། །</Text>
            <Text style={styles.phonetic}>让当玛甲意西俄爱龙</Text>
            <Text style={styles.prayerChinese}>自性不灭智慧五光界</Text>
          </View>

          <View style={styles.verseBlock}>
            <Text style={styles.prayerTibetan}>ངོ་བོ་དཔལ་ལྡན་འཇམ་པའི་རྡོ་རྗེ་ལ། །</Text>
            <Text style={styles.phonetic}>俄吾华单加毕多吉啦</Text>
            <Text style={styles.prayerChinese}>本体具德文殊金刚尊</Text>
          </View>

          <View style={styles.verseBlock}>
            <Text style={styles.prayerTibetan}>རྣམ་པ་སྐྱབས་གཅིག་ཡིད་བཞིན་ནོར་བུ་ཉིད། །</Text>
            <Text style={styles.phonetic}>南巴加吉意斯洛布尼</Text>
            <Text style={styles.prayerChinese}>形相唯一怙主如意宝</Text>
          </View>

          <View style={styles.verseBlock}>
            <Text style={styles.prayerTibetan}>དཀར་གསལ་མཛེས་འཛུམ་པཎྜི་ཏ་ཡི་ཆས། །</Text>
            <Text style={styles.phonetic}>呷萨则争班智达义其</Text>
            <Text style={styles.prayerChinese}>白明美颜班智达之饰</Text>
          </View>

          <View style={styles.verseBlock}>
            <Text style={styles.prayerTibetan}>ཆོས་འཆད་ཕྱག་རྒྱས་རལ་གྲི་གླེགས་བམ་བསྣམས། །</Text>
            <Text style={styles.phonetic}>曲恰夏杰Ra支拿瓦南</Text>
            <Text style={styles.prayerChinese}>说法手印持执宝剑函</Text>
          </View>

          <View style={styles.verseBlock}>
            <Text style={styles.prayerTibetan}>ཞབས་གཉིས་སྐྱིལ་ཀྲུང་འོད་ཟེར་མུ་མེད་འཕྲོ། །</Text>
            <Text style={styles.phonetic}>夏尼吉中俄热木美卓</Text>
            <Text style={styles.prayerChinese}>二足跏趺照射无边光</Text>
          </View>

          <View style={styles.verseBlock}>
            <Text style={styles.prayerTibetan}>རང་སྣང་དག་པའི་རྒྱན་དུ་ལམ་མེར་གསལ། །</Text>
            <Text style={styles.phonetic}>让郎达毕坚得拉美萨</Text>
            <Text style={styles.prayerChinese}>一切自现观为净明然</Text>
          </View>

          <Text style={styles.sectionTitle}>གསོལ་བ་གདབ་པ་ནི།{'\n'}祈祷者：</Text>

          <View style={styles.verseBlock}>
            <Text style={styles.prayerTibetan}>གནས་ཆེན་རི་བོ་རྩེ་ལྔའི་ཞིང་ཁམས་སུ། །</Text>
            <Text style={styles.phonetic}>涅庆日俄再爱香克思</Text>
            <Text style={styles.prayerChinese}>自大圣境五台山</Text>
          </View>

          <View style={styles.verseBlock}>
            <Text style={styles.prayerTibetan}>འཇམ་དཔལ་ཐུགས་ཀྱི་བྱིན་རླབས་ཡིད་ལ་སྨིན། །</Text>
            <Text style={styles.phonetic}>加华头吉新拉意拉闷</Text>
            <Text style={styles.prayerChinese}>文殊加持入心者</Text>
          </View>

          <View style={styles.verseBlock}>
            <Text style={styles.prayerTibetan}>འཇིགས་མེད་ཕུན་ཚོགས་ཞབས་ལ་གསོལ་བ་འདེབས། །</Text>
            <Text style={styles.phonetic}>晋美彭措夏拉所瓦得</Text>
            <Text style={styles.prayerChinese}>祈祷晋美彭措足</Text>
          </View>

          <View style={styles.verseBlock}>
            <Text style={styles.prayerTibetan}>དགོངས་བརྒྱུད་རྟོགས་པ་འཕོ་བར་བྱིན་གྱིས་རློབས། །</Text>
            <Text style={styles.phonetic}>共机多巴破瓦新吉罗</Text>
            <Text style={styles.prayerChinese}>证悟意传求加持</Text>
          </View>

          <Text style={styles.sectionTitle}>ཅི་ནུས་བསགས།{'\n'}（随力念诵）</Text>

          <View style={styles.verseBlock}>
            <Text style={styles.prayerTibetan}>མཐར་ནི་བླ་མ་འོད་ལྔའི་ཐིག་ལེར་གྱུར།</Text>
            <Text style={styles.phonetic}>蹋尼喇嘛俄爱头耐吉</Text>
            <Text style={styles.prayerChinese}>后师已成五光之明点</Text>
          </View>

          <View style={styles.verseBlock}>
            <Text style={styles.prayerTibetan}>རང་གི་སྤྱི་བོ་ནས་ཞུགས་སྙིང་དབུས་ཐིམ། །</Text>
            <Text style={styles.phonetic}>让革即俄涅修娘为腾</Text>
            <Text style={styles.prayerChinese}>由从自顶渗入于心间</Text>
          </View>

          <View style={styles.verseBlock}>
            <Text style={styles.prayerTibetan}>རྒྱལ་ཀུན་ཡེ་ཤེས་གཅིག་འདུས་བླ་མ་དང༌། །</Text>
            <Text style={styles.phonetic}>嘉更意西旧第喇嘛当</Text>
            <Text style={styles.prayerChinese}>当思诸佛智慧总集师</Text>
          </View>

          <View style={styles.verseBlock}>
            <Text style={styles.prayerTibetan}>སྐལ་བ་མཉམ་པའི་བྱིན་རླབས་ཐོབ་པར་བསམ། །</Text>
            <Text style={styles.phonetic}>嘎瓦南毕新拉托巴萨</Text>
            <Text style={styles.prayerChinese}>获得于彼同份之加持</Text>
          </View>

          <Text style={styles.instructionText}>
            ཞེས་བློ་འདས་ཆོས་སྐུའི་ངང་དུ་མཉམ་པར་བཞག དེ་ལས་ལྡང་བ་ན་སྣང་སྲིད་བླ་མའི་ངོ་བོར་བལྟས་ཏེ་རྒྱུན་གྱི་སྤྱོད་ལམ་ལ་འཇུག་པར་བྱའོ། །{'\n'}
            如是离意法身中入定，彼中起座时观诸现有即师本性，而行平常威仪也。
          </Text>

          <Text style={styles.colophon}>
            ཞེས་རབ་བྱུང་བཅུ་བདུན་པའི་ཤིང་ཕག་ཟླ ༦ ཚེས་ ༢༥ དུས་སུ་གངས་ལྗོངས་སྨྲ་བའི་དབང་ཕྱུག་སྤྲུལ་པའི་སྐུ་མཆོག་བསྟན་འཛིན་རྒྱ་མཚོས་རང་དང་སློབ་ཚོགས་ཡོངས་ལ་ཕན་པའི་ཕྱིར་དུ་འདི་འདྲ་ཞིག་དགོས་ཞེས་སྐུལ་མ་མཛད་པས་དེ་མ་ཐག་རིག་སྟོང་འཇམ་པའི་དབྱངས་ཀྱི་རང་སྒྲ་རྩོལ་མེད་དུ་ཤར་བ་བཞིན་མཁས་བཙུན་གྲུབ་པའི་དབང་ཕྱུག་སྤྲུལ་ལུང་རྟོགས་རྒྱ་མཚོས་ཡི་གེ་པ་བྱས་ཏེ་ངག་དབང་བློ་གྲོས་མཚུངས་མེད་ཀྱིས་མཁའ་དབྱིངས་འཇའ་སྤྲིན་འཁྱིལ་བའི་རི་ཁྲོད་ནས་སྤེལ་བ་དགེ། །།
          </Text>

          <Text style={styles.colophonChinese}>
            此文于十七胜生闰年木猪年六月二十五日，由雪域语自在化身丹增降措乞求曰：为利我等诸徒众之需，请造如是瑜伽。 如此劝求{'\n'}
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
    height: 450,
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
  verseBlock: {
    marginBottom: 16,
    alignItems: 'center',
  },
  prayerTibetan: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    lineHeight: 24,
    textAlign: 'center',
  },
  phonetic: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 2,
  },
  prayerChinese: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DesignSystem.colors.primary,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#374151',
    lineHeight: 22,
    marginTop: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
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
