import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
} from 'date-fns';
import { fetchReadings, ReadingsResponse, UserDataFilters } from './fetchUserData';

export const fetchWeeklyData = async (
  clerk_id: string,
  token: string,
  extraFilters?: Partial<UserDataFilters>
): Promise<ReadingsResponse> => {
  const now = new Date();
  const timeFrame: UserDataFilters = {
    start_date: format(startOfWeek(now), 'yyyy-MM-dd'),
    end_date: format(endOfWeek(now), 'yyyy-MM-dd'),
  };
  const filters: UserDataFilters = { ...timeFrame, ...extraFilters };
  return await fetchReadings(clerk_id, token, filters);
};

export const fetchMonthlyData = async (
  clerk_id: string,
  token: string,
  extraFilters?: Partial<UserDataFilters>
): Promise<ReadingsResponse> => {
  const now = new Date();
  const timeFrame: UserDataFilters = {
    start_date: format(startOfMonth(now), 'yyyy-MM-dd'),
    end_date: format(endOfMonth(now), 'yyyy-MM-dd'),
  };
  const filters: UserDataFilters = { ...timeFrame, ...extraFilters };
  return await fetchReadings(clerk_id, token, filters);
};

export const fetchYearlyData = async (
  clerk_id: string,
  token: string,
  extraFilters?: Partial<UserDataFilters>
): Promise<ReadingsResponse> => {
  const now = new Date();
  const timeFrame: UserDataFilters = {
    start_date: format(startOfYear(now), 'yyyy-MM-dd'),
    end_date: format(endOfYear(now), 'yyyy-MM-dd'),
  };
  const filters: UserDataFilters = { ...timeFrame, ...extraFilters };
  return await fetchReadings(clerk_id, token, filters);
};
