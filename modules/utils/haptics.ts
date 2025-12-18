import * as Haptics from 'expo-haptics';

export const hapticVibrate = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
export const hapticVibrateSoft = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
