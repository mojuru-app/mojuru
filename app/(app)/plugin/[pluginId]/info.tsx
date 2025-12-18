import { Button } from '@/components/ui/Buttons';
import Txt from '@/components/ui/Txt';
import { BORDER_RADIUS, FRAME_MARGIN } from '@/constants/Utils';
import { usePluginManager } from '@/lib/plugins/usePluginManager';
import useTheme from '@/hooks/useTheme';
import { capitalizeFirst } from '@/modules/utils/utils';
import { openUrlWithConfirmation } from '@/modules/utils/link';
import { hapticVibrate } from '@/modules/utils/haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PluginInfoScreen() {
  const { theme } = useTheme();

  const params = useLocalSearchParams();
  const onlyInfo = JSON.parse(params.onlyInfo as string);
  const metadata = JSON.parse(params.pluginMetadata as string);

  const { installPlugin, removePlugin } = usePluginManager(metadata.pluginProvider);

  useEffect(() => {
    hapticVibrate();
  }, []);

  const handleInstallPlugin = async () => {
    try {
      await installPlugin(metadata);
    } catch (err) {
      console.error('Failed to install plugin. Please try again.' + err);
    } finally {
      router.back();
    }
  };

  const handleRemovePlugin = async () => {
    Alert.alert('Remove Plugin', `Are you sure you want to remove the ${metadata.name} plugin?`, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Remove',
        onPress: async () => {
          try {
            await removePlugin(metadata.name);
            router.back();
          } catch (err) {
            console.error('Failed to remove plugin. Please try again.');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        <ImageBackground
          source={{ uri: metadata.iconUrl }}
          style={{
            width: SCREEN_WIDTH,
            height: SCREEN_WIDTH / 1.3,
            position: 'relative',
          }}
          resizeMode="cover"
        >
          <BlurView intensity={80} style={{ ...StyleSheet.absoluteFillObject, zIndex: 0 }}>
            <LinearGradient
              colors={['transparent', theme.background.toString()]}
              style={{ ...StyleSheet.absoluteFillObject }}
            />
          </BlurView>

          <View
            style={{
              position: 'absolute',
              top: 45,
              left: 0,
              right: 0,
              alignItems: 'center',
              zIndex: 1,
            }}
          >
            <Image
              source={{ uri: metadata.iconUrl }}
              style={{
                width: 120,
                height: 120,
                borderRadius: BORDER_RADIUS,
                marginBottom: 12,
              }}
              resizeMode="cover"
            />

            <Txt style={{ fontSize: 30, fontFamily: 'Bold', marginBottom: 4 }}>{metadata.name}</Txt>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Txt
                style={{
                  fontSize: 15,
                  fontFamily: 'SemiBold',
                  color: theme.textMuted,
                }}
              >
                {capitalizeFirst(metadata.author.name)}
              </Txt>

              <Image
                source={{ uri: metadata.author.icon }}
                style={{ width: 24, height: 24, borderRadius: 999 }}
              />
            </View>
          </View>
        </ImageBackground>

        <View
          style={{
            flex: 1,
            marginHorizontal: FRAME_MARGIN,
            transform: [{ translateY: -55 }],
            marginBottom: 140,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: theme.foreground,
              borderRadius: BORDER_RADIUS * 3,
              paddingVertical: 16,
              marginBottom: 30,
            }}
          >
            <BarInfoItem label="Version" value={metadata.version} />
            <BarInfoItem label="Language" value={metadata.language} />
            <BarInfoItem label="Quality" value={metadata.quality} />
          </View>

          {!metadata.compatible && (
            <Txt
              style={{
                textAlign: 'center',
                color: theme.alert,
                fontFamily: 'SemiBold',
                transform: [{ translateY: -12 }],
              }}
            >
              THIS PLUGIN IS INCOMPATIBLE
            </Txt>
          )}

          <View style={{ gap: 10 }}>
            <InfoItem label="Source Type" value={metadata.type} />
            <InfoItem label="Provider" value={metadata.contentProvider} />
            <InfoItem label="Stream Type" value={metadata.streamType} />
            <InfoItem label="Base Url" value={metadata.baseUrl} isLink />
            <InfoItem label="Script Url" value={metadata.scriptUrl} isLink />
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.background,
          paddingHorizontal: FRAME_MARGIN,
          paddingBottom: 30,
          paddingTop: 10,
        }}
      >
        <View>
          {onlyInfo ? (
            <>
              <Button title="Remove Plugin" type="destructive" onPress={handleRemovePlugin} />
              <Button
                title="Close"
                type="ghost"
                onPress={() => {
                  router.back();
                }}
              />
            </>
          ) : (
            <>
              {metadata.compatible && (
                <Button title="Install Plugin" onPress={handleInstallPlugin} />
              )}
              <Button
                title="Cancel"
                type="ghost"
                onPress={() => {
                  router.back();
                }}
              />
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const BarInfoItem: React.FC<{
  label: string;
  value?: string;
}> = ({ label, value = undefined }) => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'column',
        gap: 5,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Txt
        style={{
          fontSize: 14,
          fontFamily: 'SemiBold',
          color: theme.textMuted,
          textAlign: 'center',
        }}
      >
        {label}
      </Txt>
      <Txt
        style={{
          fontSize: 16,
          fontFamily: 'SemiBold',
          color: theme.text,
          textAlign: 'center',
        }}
      >
        {value}
      </Txt>
    </View>
  );
};

const InfoItem: React.FC<{
  label: string;
  value?: string;
  isLink?: boolean;
}> = ({ label, value = '', isLink = false }) => {
  const { theme } = useTheme();

  const handlePress = () => {
    if (isLink && value) {
      openUrlWithConfirmation(value);
    }
  };

  return (
    <View
      style={{
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Txt style={{ fontSize: 14, fontFamily: 'Medium', color: theme.textMuted }}>{label}</Txt>

      {isLink ? (
        <TouchableOpacity activeOpacity={0.5} onPress={handlePress}>
          <Txt
            style={{
              fontSize: 16,
              fontFamily: 'Medium',
              color: theme.textSupporting,
              textDecorationLine: 'underline',
            }}
          >
            {value}
          </Txt>
        </TouchableOpacity>
      ) : (
        <Txt
          style={{
            fontSize: 16,
            fontFamily: 'Medium',
            color: theme.textSupporting,
          }}
        >
          {value}
        </Txt>
      )}
    </View>
  );
};
