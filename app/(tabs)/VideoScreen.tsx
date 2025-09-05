import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function VideoScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>رابط البث:</Text>
      <Text>{url}</Text>
    </View>
  );
}
