import { useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { DesignSystem } from "@/constants/DesignSystem";

export default function PracticeDetailRedirect() {
  const { practiceId } = useLocalSearchParams<{ practiceId: string }>();

  useEffect(() => {
    if (practiceId) {
      router.replace({
        pathname: "/practice-history",
        params: {
          projectId: practiceId,
          practiceName: "",
        },
      });
    }
  }, [practiceId]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={DesignSystem.colors.redTara} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: DesignSystem.colors.background,
  },
});
