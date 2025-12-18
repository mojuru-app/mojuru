import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import useTheme from '@/hooks/useTheme';
import { openUrlWithConfirmation } from '@/modules/utils/link';
import Slider from '@react-native-community/slider';
import { Href, router } from 'expo-router';
import { ChevronRight, Link, LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { ColorValue, Switch, TouchableHighlight, TouchableOpacity, View } from 'react-native';

import OptionsModal, { Options, Value } from '../ui/OptionsModal';
import Txt from '../ui/Txt';
import SettingsItemLabel from './ SettingsItemLabel';
import PlusLabelTag from './PlusLabelTag';

const SettingsItem: React.FC<{
  /**
   * the label to display to the left of the item
   */
  label: string;
  /**
   * custom label & icon color
   */
  labelColor?: ColorValue;
  /**
   * Icon or Image to show near the label
   * Icon and imageUri are exclusive.
   * of both of them are passed, Icon
   * will be used
   */
  Icon?: LucideIcon;
  imageUri?: string;
  /**
   * isPremium, text, route, action, link, toggle, select and slider are exclusive.
   * if more than one is passed, the higher in this list
   * will be used
   *
   * textColor will work only if text is used
   */
  isPremium?: boolean;
  text?: string;
  textColor?: ColorValue;
  route?: Href;
  action?: (...args: any) => void;
  link?: string;
  toggle?: {
    value: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
  };
  select?: {
    options: Options;
    headingText: string;
    defaultValue: Value;
    closeOnChange?: boolean;
    onChange: (value: Value) => void;
  };
  /**
   * slider value (appare sotto la riga principale, se presente)
   */
  slider?: {
    min: number;
    max: number;
    step?: number;
    value: number;
    unit?: string;
    onValueChange?: (value: number) => void;
    onSlidingComplete?: (value: any) => void;
  };
  customRight?: React.ReactNode;
}> = ({
  label,
  labelColor,
  Icon,
  imageUri,
  isPremium,
  text,
  textColor,
  route,
  action,
  link,
  toggle,
  select,
  slider,
  customRight,
}) => {
  const { theme } = useTheme();
  const { premiumFeatures } = usePremiumFeatures();

  const isLocked = isPremium && !premiumFeatures;
  const [showSelectModal, setShowSelectModal] = useState<boolean>(false);

  const handleIsPremium = () => {
    router.push('/premium-landing');
  };

  const handleRoute = () => {
    if (route) router.push(route);
  };

  const handleAction = () => {
    if (action) action();
  };

  const handleLink = async () => {
    if (link) openUrlWithConfirmation(link);
  };

  const pressable = isLocked || route || action || link;

  return (
    <TouchableHighlight
      onPress={() => {
        if (isLocked) handleIsPremium();
        else if (route) handleRoute();
        else if (action) handleAction();
        else if (link) handleLink();
      }}
      underlayColor={theme.mist}
      disabled={!pressable}
      style={{
        width: '100%',
        paddingHorizontal: 16,
        paddingTop: 0,
        paddingBottom: slider ? 12 : 0,
        backgroundColor: theme.foreground,
      }}
    >
      <View>
        <View
          style={{
            height: imageUri && !Icon ? 75 : 50,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'nowrap',
          }}
        >
          <SettingsItemLabel
            label={label}
            Icon={Icon}
            imageUri={imageUri}
            labelColor={labelColor}
          />

          <View
            style={{
              flexShrink: 1,
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
            }}
          >
            {isLocked ? (
              <PlusLabelTag isPlus />
            ) : text ? (
              <Txt
                style={{
                  color: textColor ?? theme.textMuted,
                  fontSize: 15,
                  fontFamily: 'Medium',
                }}
              >
                {text}
              </Txt>
            ) : toggle ? (
              <Switch
                value={toggle.value}
                onValueChange={toggle.onChange}
                trackColor={{
                  false: theme.textMuted,
                  true: theme.primary,
                }}
                thumbColor={theme.text}
                disabled={toggle.disabled}
              />
            ) : route ? (
              <ChevronRight size={22} color={theme.textMuted} />
            ) : action ? (
              <View />
            ) : link ? (
              <Link size={18} color={theme.textMuted} />
            ) : select ? (
              <>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => {
                    setShowSelectModal(true);
                  }}
                >
                  <Txt style={{ color: theme.textMuted }}>
                    {select.options.find((o) => o.value === select.defaultValue)?.label}
                  </Txt>
                </TouchableOpacity>

                <OptionsModal
                  visible={showSelectModal}
                  closeOnChange={select.closeOnChange ?? true}
                  onClose={() => {
                    setShowSelectModal(false);
                  }}
                  options={select.options}
                  defaultValue={select.defaultValue}
                  onChange={select.onChange}
                />
              </>
            ) : slider ? (
              <Txt style={{ color: theme.textMuted }}>
                {slider.value}
                {slider.unit}
              </Txt>
            ) : customRight ? (
              customRight
            ) : (
              <></>
            )}
          </View>
        </View>

        {slider && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: -10 }}>
            <Txt style={{ color: theme.textMuted, fontSize: 13, width: 50, textAlign: 'left' }}>
              {slider.min}
              {slider.unit}
            </Txt>

            <Slider
              disabled={isLocked}
              style={{ flex: 1, marginHorizontal: 2 }}
              minimumValue={slider.min}
              maximumValue={slider.max}
              step={slider.step ?? 1}
              value={slider.value}
              onValueChange={slider.onValueChange}
              onSlidingComplete={slider.onSlidingComplete}
              minimumTrackTintColor={theme.primary.toString()}
              maximumTrackTintColor={theme.mist.toString()}
              thumbTintColor={theme.text.toString()}
            />

            <Txt style={{ color: theme.textMuted, fontSize: 13, width: 50, textAlign: 'right' }}>
              {slider.max}
              {slider.unit}
            </Txt>
          </View>
        )}
      </View>
    </TouchableHighlight>
  );
};

export default SettingsItem;
