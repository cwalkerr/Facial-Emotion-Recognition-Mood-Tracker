import React, { useEffect } from 'react';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
} from '@/components/ui/gluestack-imports/actionsheet';
import {
  Checkbox,
  CheckboxGroup,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from '@/components/ui/gluestack-imports/checkbox';
import {
  EmotionCountsOverTime,
  fetchCountsOverTime,
} from '@/services/api/fetchUserData';
import { CheckIcon, ChevronDownIcon } from 'lucide-react-native';
import { Emotions } from '@/constants/Emotions';
import { Button, ButtonText } from './gluestack-imports/button';
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from './gluestack-imports/select';
import { useAuth } from '@clerk/clerk-expo';
import { ActivityIndicator, Alert } from 'react-native';

interface LineChartFilterProps {
  showActionsheet: boolean;
  setShowActionsheet: React.Dispatch<React.SetStateAction<boolean>>;
  activeEmotions: string[];
  timeframeLabel: string;
  onFetchFilteredData: (
    data: EmotionCountsOverTime,
    filters: { emotions: string[]; timeframe: string }
  ) => void; // callback to parent component to pass the fetched data
}

export default function LineChartFilters({
  showActionsheet,
  setShowActionsheet,
  activeEmotions,
  onFetchFilteredData,
  timeframeLabel,
}: LineChartFilterProps): React.JSX.Element {
  const [selectedEmotions, setSelectedEmotions] =
    React.useState<string[]>(activeEmotions); // defaults to the filtered emotions passed from the parent component, always starts the same
  const [timeframe, setTimeframe] = React.useState<string>('30d'); // default to 30 days
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { getToken, userId } = useAuth();

  // set the timeframe based on the label
  useEffect(() => {
    switch (timeframeLabel) {
      case 'Past 7 Days':
        setTimeframe('7d');
        break;
      case 'Past 30 Days':
        setTimeframe('30d');
        break;
      case 'This Year':
        setTimeframe('1yr');
        break;
      default:
        setTimeframe('30d');
        break;
    }
  }, [timeframeLabel]);

  const handleError = (
    logMessage: string,
    alertMessage: string = 'Failed to filter line chart, please try again'
  ): void => {
    console.error(logMessage);
    Alert.alert('Error', alertMessage);
  };

  // fetch the filtered data after the user has selected the filters, update the parent component
  const fetchFilteredData = async () => {
    try {
      const token = await getToken();

      if (!userId) {
        handleError('ClerkID is null');
        return;
      }
      if (token === null) {
        handleError('Token is null');
        return;
      }
      const data: EmotionCountsOverTime = await fetchCountsOverTime(
        userId,
        token,
        timeframe,
        selectedEmotions
      );
      //send the filtered data to the parent component
      onFetchFilteredData(data, {
        emotions: selectedEmotions,
        timeframe: timeframe,
      });
    } catch (error) {
      if (error instanceof Error) {
        handleError('Failed to fetch emotion count data', error.message);
      } else {
        handleError('Failed to fetch emotion count data');
      }
    }
  };

  // close the actionsheet handle loading state and fetch the filtered data
  const handleClose = async () => {
    setIsLoading(true);
    await fetchFilteredData();
    setShowActionsheet(false);
    setIsLoading(false);
  };

  return (
    <Actionsheet isOpen={showActionsheet} onClose={handleClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <ActionsheetItem>
          {/* select component for each timeframe */}
          <Select
            onValueChange={value => setTimeframe(value)}
            closeOnOverlayClick={true}
            initialLabel={timeframeLabel}
            defaultValue={timeframe}>
            <SelectTrigger variant="underlined" size="lg">
              <SelectInput placeholder="Timeframe" />
              <SelectIcon as={ChevronDownIcon} />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent className={'p-4'}>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                <SelectItem key={'30d'} label={'Past 30 Days'} value={'30d'} />
                <SelectItem key={'7d'} label={'Past 7 Days'} value={'7d'} />
                <SelectItem key={'1yr'} label={'This Year'} value={'1yr'} />
              </SelectContent>
            </SelectPortal>
          </Select>
        </ActionsheetItem>
        <ActionsheetItem>
          <CheckboxGroup
            // checkboxes for each emotion, allow multiple selections
            value={selectedEmotions}
            onChange={keys => {
              setSelectedEmotions(keys);
            }}>
            {Object.values(Emotions).map(emotion => (
              <Checkbox
                size="lg"
                className="my-2"
                value={emotion}
                key={emotion}
                aria-label={`Checkbox for ${emotion}`}>
                <CheckboxIndicator aria-label={`Checkbox for ${emotion}`}>
                  <CheckboxIcon as={CheckIcon} />
                </CheckboxIndicator>
                <CheckboxLabel className="capitalize">{emotion}</CheckboxLabel>
              </Checkbox>
            ))}
          </CheckboxGroup>
        </ActionsheetItem>
        <Button
          size="lg"
          variant="solid"
          action="primary"
          className="bg-custom-primary active:bg-custom-base rounded-2xl my-4 justify-end"
          onPress={handleClose}
          // disable the button if the data is loading, and show a loading spinner on the button
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={'white'} />
          ) : (
            <ButtonText>Search</ButtonText>
          )}
        </Button>
      </ActionsheetContent>
    </Actionsheet>
  );
}