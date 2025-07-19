
import { View, Text } from 'react-native';

export default function HealthCheck() {
  // Respond immediately without any dependencies
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 18, color: '#4CAF50' }}>✅ OK</Text>
    </View>
  );
}
