import { Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

const ENTER_EASING = Easing.out(Easing.cubic);
const EXIT_EASING = Easing.in(Easing.cubic);

export const PLAYER_TOGGLE_CONTROLS_TIMING = 250;
export const PLAYER_TOGGLE_CONTROLS_DELAY = 0;

export const FADE_ENTERING = FadeIn.duration(PLAYER_TOGGLE_CONTROLS_TIMING).easing(ENTER_EASING);
export const FADE_EXITING = FadeOut.duration(PLAYER_TOGGLE_CONTROLS_TIMING).easing(EXIT_EASING);
export const SLIDE_ENTERING = SlideInDown.duration(PLAYER_TOGGLE_CONTROLS_TIMING).easing(ENTER_EASING);
export const SLIDE_EXITING = SlideOutDown.duration(PLAYER_TOGGLE_CONTROLS_TIMING).easing(EXIT_EASING);
