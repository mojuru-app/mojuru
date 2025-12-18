import Frame from '@/components/Frame';
import SettingsItemMultiSelect from '@/components/settings/SettingsItemMultiSelect';
import SettingsItemsGroup from '@/components/settings/SettingsItemsGroup';
import SettingsWrapper from '@/components/settings/SettingsWrapper';
import { Squirrel } from 'lucide-react-native';
import { useState } from 'react';

export default function FeedSettingsScreen() {
  const [selectedSections, setSelectedSections] = useState<string[]>(['trending', 'recommended']);

  const sectionOptions = [
    { label: 'Trending', value: 'trending' },
    { label: 'New Releases', value: 'new' },
    { label: 'Recommended', value: 'recommended' },
    { label: 'Top Rated', value: 'top' },
    { label: 'Watch Again', value: 'watch_again' },
  ];

  return (
    <Frame bigHeading="Home Sections" showCollapsibleHeader collapsibleHeaderText="Home Sections" backButton>
      <SettingsWrapper>
        <SettingsItemsGroup description="Control which sections are shown on Home">
          <SettingsItemMultiSelect
            label="Visible Sections"
            Icon={Squirrel}
            options={sectionOptions}
            selectedValues={selectedSections}
            onChange={setSelectedSections}
          />
        </SettingsItemsGroup>
      </SettingsWrapper>
    </Frame>
  );
}
