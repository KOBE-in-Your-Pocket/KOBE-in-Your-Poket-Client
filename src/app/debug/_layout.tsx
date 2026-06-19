import { Stack } from 'expo-router';

export default function DebugLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Debug' }} />
      <Stack.Screen name="use-current-location" options={{ title: 'useCurrentLocation' }} />
    </Stack>
  );
}
