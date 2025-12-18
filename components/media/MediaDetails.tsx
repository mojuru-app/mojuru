import { View } from 'react-native';
import Txt from '../ui/Txt';
import React, { useEffect } from 'react';
import useTheme from '@/hooks/useTheme';
import { MediaData } from '@/models/mediaData';
import { formatFormat, formatStatus, parseFuzzyDate } from '@/modules/utils/utils';
import { MediaAvatarList } from './MediaAvatarList';

const MediaDetails: React.FC<{
  media?: MediaData;
}> = ({ media }) => {
  if (!media) return;

  return (
    <View style={{ flex: 1, gap: 14 }}>
      <InfoItem label="Format" value={formatFormat(media.format)} />
      <InfoItem label="Status" value={formatStatus(media.status)} />
      <InfoItem label="Airing Period" value={`${parseFuzzyDate(media.startDate)} - ${parseFuzzyDate(media.endDate)}`} />
      <InfoItem label="Other Titles" value={media.synonyms?.join(' - ')} />
      <InfoItem label="Genres" value={media.genres?.join(' - ')} />
      <InfoItem label="Tags" value={media.tags?.join(' - ')} />
      <InfoItem label="Studios" value={media.studios?.join(' - ')} />
      {media.characters && (
        <MediaAvatarList
          items={media.characters.map((c) => ({
            image: c.image,
            title: c.name,
            subtitle: c.role,
          }))}
        />
      )}
    </View>
  );
};

export default MediaDetails;

const InfoItem: React.FC<{
  label: string;
  value?: string;
}> = ({ label, value }) => {
  const { theme } = useTheme();

  if (!value) return null;

  return (
    <View style={{ gap: 1 }}>
      <Txt
        style={{
          color: theme.textMuted,
          fontSize: 12,
          fontFamily: 'SemiBold',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Txt>
      <Txt
        style={{
          color: theme.textShy,
          fontSize: 14,
          lineHeight: 18,
          fontFamily: 'Medium',
        }}
      >
        {value}
      </Txt>
    </View>
  );
};
