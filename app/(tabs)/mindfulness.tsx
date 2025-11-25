import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import { Colors } from '@/constants/Colors';
import PageTemplate from '@/components/PageTemplate';

export default function MindfulnessScreen() {
  return (
    <PageTemplate
      title="心性" 
      subtitle="心性如虚空，妄念是彩虹"
      scrollable={false}
      backgroundColor={Colors.background}
      padding={0}
    >
      <ScrollView style={styles.scrollView}>
        
        {/* Thangka Image - Full Width */}
        <View style={styles.thangkaContainer}>
          <Image
            source={require('@/assets/images/fawang-thangka.png')}
            style={styles.thangkaImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.scrollContent}>

        {/* Prayer Title */}
        <Text style={styles.prayerTitleTibetan}>
          ༄༅། །བླ་མའི་རྣལ་འབྱོར་བྱིན་རླབས་མྱུར་སྩོལ་བཞུགས་སོ། །
        </Text>
        <Text style={styles.prayerTitleChinese}>
          上师瑜伽·速赐加持
        </Text>

        {/* Prayer Syllable */}
        <Text style={styles.syllable}>ཨ།</Text>
        <Text style={styles.syllableChinese}>阿</Text>

        {/* First Verse */}
        <View style={styles.verseBlock}>
          <Text style={styles.tibetanText}>
            འཁོར་འདས་ཆོས་ཀུན་ཀ་དག་རིག་པའི་ངང༌། །{'\n'}
            རང་གདངས་མ་འགགས་ཡེ་ཤེས་འོད་ལྔའི་ཀློང༌། །{'\n'}
            ངོ་བོ་དཔལ་ལྡན་འཇམ་པའི་རྡོ་རྗེ་ལ། །{'\n'}
            རྣམ་པ་སྐྱབས་གཅིག་ཡིད་བཞིན་ནོར་བུ་ཉིད། །{'\n'}
            དཀར་གསལ་མཛེས་འཛུམ་པཎྜི་ཏ་ཡི་ཆས། །{'\n'}
            ཆོས་འཆད་ཕྱག་རྒྱས་རལ་གྲི་གླེགས་བམ་བསྣམས། །{'\n'}
            ཞབས་གཉིས་སྐྱིལ་ཀྲུང་འོད་ཟེར་མུ་མེད་འཕྲོ། །{'\n'}
            རང་སྣང་དག་པའི་རྒྱན་དུ་ལམ་མེར་གསལ། །
          </Text>
          <Text style={styles.chineseText}>
            轮涅诸法本净觉性中{'\n'}
            自性不灭智慧五光界{'\n'}
            本体具德文殊金刚尊{'\n'}
            形相唯一怙主如意宝{'\n'}
            白明美颜班智达之饰{'\n'}
            说法手印持执宝剑函{'\n'}
            二足跏趺照射无边光{'\n'}
            一切自现观为净明然
          </Text>
        </View>

        {/* Prayer Request Section */}
        <Text style={styles.sectionTitle}>གསོལ་བ་གདབ་པ་ནི།</Text>
        <Text style={styles.sectionTitleChinese}>祈祷者：</Text>

        <View style={styles.verseBlock}>
          <Text style={styles.tibetanText}>
            གནས་ཆེན་རི་བོ་རྩེ་ལྔའི་ཞིང་ཁམས་སུ། །{'\n'}
            འཇམ་དཔལ་ཐུགས་ཀྱི་བྱིན་རླབས་ཡིད་ལ་སྨིན། །{'\n'}
            འཇིགས་མེད་ཕུན་ཚོགས་ཞབས་ལ་གསོལ་བ་འདེབས། །{'\n'}
            དགོངས་བརྒྱུད་རྟོགས་པ་འཕོ་བར་བྱིན་གྱིས་རློབས། །
          </Text>
          <Text style={styles.chineseText}>
            自大圣境五台山{'\n'}
            文殊加持入心者{'\n'}
            祈祷晋美彭措足{'\n'}
            证悟意传求加持
          </Text>
        </View>

        {/* Capacity Note */}
        <Text style={styles.capacityNote}>ཅི་ནུས་བསགས།</Text>
        <Text style={styles.capacityNoteChinese}>（随力念诵）</Text>

        {/* Conclusion */}
        <View style={styles.verseBlock}>
          <Text style={styles.tibetanText}>
            མཐར་ནི་བླ་མ་འོད་ལྔའི་ཐིག་ལེར་གྱུར།{'\n'}
            རང་གི་སྤྱི་བོ་ནས་ཞུགས་སྙིང་དབུས་ཐིམ། །{'\n'}
            རྒྱལ་ཀུན་ཡེ་ཤེས་གཅིག་འདུས་བླ་མ་དང༌། །{'\n'}
            སྐལ་བ་མཉམ་པའི་བྱིན་རླབས་ཐོབ་པར་བསམ། །
          </Text>
          <Text style={styles.chineseText}>
            后师已成五光之明点{'\n'}
            由从自顶渗入于心间{'\n'}
            当思诸佛智慧总集师{'\n'}
            获得于彼同份之加持
          </Text>
        </View>

        {/* Final Instructions */}
        <View style={styles.verseBlock}>
          <Text style={styles.chineseText}>
            如是离意法身中入定，彼中起座时观诸现有即师本性，而行平常威仪也。
          </Text>
        </View>

        {/* Colophon */}
        <View style={styles.colophonContainer}>
          <Text style={styles.colophonText}>
            此文于十七胜生闰年木猪年六月二十五日，由雪域语自在化身丹增降措乞求曰：为利我等诸徒众之需，请造如是瑜伽。
          </Text>
          <Text style={styles.colophonCredit}>
            索达吉堪布 译
          </Text>
        </View>
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
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.xl,
    paddingBottom: DesignSystem.spacing.xl,
  },
  thangkaContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.lg,
  },
  thangkaImage: {
    width: '100%',
    height: 500,
  },
  prayerTitleTibetan: {
    fontSize: 16,
    lineHeight: 28,
    color: DesignSystem.colors.textPrimary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.md,
    fontWeight: '600',
  },
  prayerTitleChinese: {
    fontSize: 18,
    fontWeight: '700',
    color: DesignSystem.colors.textPrimary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.lg,
    letterSpacing: -0.3,
  },
  syllable: {
    fontSize: 24,
    lineHeight: 32,
    color: DesignSystem.colors.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: DesignSystem.spacing.sm,
  },
  syllableChinese: {
    fontSize: 16,
    color: DesignSystem.colors.textSecondary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.lg,
  },
  verseBlock: {
    marginBottom: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
  },
  tibetanText: {
    fontSize: 15,
    lineHeight: 26,
    color: DesignSystem.colors.textPrimary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.md,
    fontWeight: '500',
  },
  chineseText: {
    fontSize: 15,
    lineHeight: 26,
    color: DesignSystem.colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 28,
    color: DesignSystem.colors.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.sm,
  },
  sectionTitleChinese: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignSystem.colors.textPrimary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.lg,
  },
  capacityNote: {
    fontSize: 14,
    lineHeight: 24,
    color: DesignSystem.colors.textSecondary,
    textAlign: 'center',
    marginTop: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.sm,
    fontStyle: 'italic',
  },
  capacityNoteChinese: {
    fontSize: 14,
    color: DesignSystem.colors.textSecondary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.lg,
    fontStyle: 'italic',
  },
  colophonContainer: {
    marginTop: DesignSystem.spacing.xl,
    paddingTop: DesignSystem.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: DesignSystem.colors.borderLight,
  },
  colophonText: {
    fontSize: 13,
    lineHeight: 22,
    color: DesignSystem.colors.textSecondary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.md,
    fontStyle: 'italic',
  },
  colophonCredit: {
    fontSize: 14,
    fontWeight: '600',
    color: DesignSystem.colors.textPrimary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.xl,
  },
});
