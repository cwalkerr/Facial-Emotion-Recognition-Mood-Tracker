import React, { useState } from 'react';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/components/ui/gluestack-imports/actionsheet';
import { ChevronDownIcon } from 'lucide-react-native';
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from './gluestack-imports/select';
import { Location } from '@/constants/Locations';
import { useAuth } from '@clerk/clerk-expo';
import {
  fetchMonthlyData,
  fetchWeeklyData,
  fetchYearlyData,
} from '@/services/api/userDataUtils';
import { Alert } from 'react-native';
import {
  fetchReadings,
  UserDataFilters,
  ReadingsResponse,
} from '@/services/api/fetchUserData';
import { ErrorResponse } from '@/services/api/customFetch';

interface ChartFilterActionSheetProps {
  showActionsheet: boolean;
  setShowActionsheet: React.Dispatch<React.SetStateAction<boolean>>;
  onFetchFilteredData: (
    data: ReadingsResponse,
    filters: { timeframe: string; location?: Location }
  ) => void; // callback to parent component to pass the fetched data
}

export default function ChartFilterActionSheet({
  showActionsheet,
  setShowActionsheet,
  onFetchFilteredData,
}: ChartFilterActionSheetProps): React.JSX.Element {
  const [location, setLocation] = useState<Location | undefined>(undefined);
  const { getToken, userId } = useAuth();

  const handleClose = () => {
    setShowActionsheet(false);
    // reset location state so prev location is ommitted if filtering again without selecting a location
    setLocation(undefined);
  };

  const handleLocationSelect = (selectedLocation: Location) => {
    setLocation(selectedLocation);
  };

  const handleTimeframeSelect = async (timeframe: string) => {
    await fetchData(timeframe, location);
    handleClose();
  };
  // multipurpose function, fetches the data based on the timeframe selected, also used in ActionSheet to print keys as filter options
  const timeFrameFuncs: {
    [key: string]: (
      userId: string,
      token: string,
      filters: Partial<UserDataFilters>
    ) => Promise<ReadingsResponse | ErrorResponse>;
  } = {
    'This Week': fetchWeeklyData,
    'This Month': fetchMonthlyData,
    'This Year': fetchYearlyData,
    'All Time': fetchReadings,
  };

  const fetchData = async (
    timeframe: string,
    location?: Location
  ): Promise<void> => {
    const token = await getToken();

    if (!userId || !token) {
      return;
    }
    const filters: Partial<UserDataFilters> = {};
    if (location) {
      filters.location = location; // only add location to filters if it is defined
    }

    let response: ReadingsResponse | ErrorResponse | null = null;
    try {
      response = await timeFrameFuncs[timeframe](userId!, token!, filters); // call the function based on the timeframe selected
      if ('error' in response) {
        Alert.alert('Error', response.error);
        return;
      }
      if ('readings' in response) {
        onFetchFilteredData(response, { timeframe, location }); // send the filtered data to the parent component
        return;
      }
      throw new Error(
        'Response at BarChartFilters does not contain readings or an error'
      );
    } catch (error) {
      console.error('Failed to fetch data', error);
      Alert.alert('Error', 'Failed to fetch data, please try again');
    }
  };
  return (
    <Actionsheet isOpen={showActionsheet} onClose={handleClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <ActionsheetItem>
          {/* Select Dropdown */}
          <Select
            onValueChange={value => handleLocationSelect(value as Location)}
            closeOnOverlayClick={true}>
            <SelectTrigger variant="underlined" size="lg">
              <SelectInput placeholder="Location" />
              <SelectIcon as={ChevronDownIcon} />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent className={'p-4'}>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                {/* display each location, use 'loc' to save confusion between location state name */}
                {Object.values(Location).map(loc => (
                  // cant seem to get text styling to work here using gluestacks textStyle prop w/ stylesheet syntax or nativewind classes
                  // ideally text size would be the same as other action sheet items below
                  <SelectItem key={loc} label={loc} value={loc} />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        </ActionsheetItem>
        {/* timeframe filter options */}
        {Object.keys(timeFrameFuncs).map(timeframe => (
          <ActionsheetItem
            key={timeframe}
            onPress={() => handleTimeframeSelect(timeframe)}>
            <ActionsheetItemText className="text-lg">
              {timeframe}
            </ActionsheetItemText>
          </ActionsheetItem>
        ))}
      </ActionsheetContent>
    </Actionsheet>
  );
}
