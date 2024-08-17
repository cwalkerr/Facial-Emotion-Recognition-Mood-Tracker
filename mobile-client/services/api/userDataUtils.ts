import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
} from 'date-fns';
import fetchUserData, { UserDataResponse, UserDataFilters } from './fetchUserData';

const now = new Date();

export const fetchWeeklyData = async (
  clerk_id: string,
  token: string
): Promise<UserDataResponse> => {
  const filters: UserDataFilters = {
    start_date: format(startOfWeek(now), 'dd-MM-yyyy'),
    end_date: format(endOfWeek(now), 'dd-MM-yyyy'),
  };
  return await fetchUserData(clerk_id, token, filters);
};

export const fetchMonthlyData = async (
  clerk_id: string,
  token: string
): Promise<UserDataResponse> => {
  const filters: UserDataFilters = {
    start_date: format(startOfMonth(now), 'dd-MM-yyyy'),
    end_date: format(endOfMonth(now), 'dd-MM-yyyy'),
  };
  return await fetchUserData(clerk_id, token, filters);
};

export const fetchYearlyData = async (
  clerk_id: string,
  token: string
): Promise<UserDataResponse> => {
  const filters: UserDataFilters = {
    start_date: format(startOfYear(now), 'dd-MM-yyyy'),
    end_date: format(endOfYear(now), 'dd-MM-yyyy'),
  };
  return await fetchUserData(clerk_id, token, filters);
};

export const fetchDataByEmotion = async (
  clerk_id: string,
  token: string,
  emotion: string
): Promise<UserDataResponse> => {
  const filters: UserDataFilters = {
    emotion: emotion,
  };
  return await fetchUserData(clerk_id, token, filters);
};

export const fetchDataByLocation = async (
  clerk_id: string,
  token: string,
  location: string
): Promise<UserDataResponse> => {
  const filters: UserDataFilters = {
    location: location,
  };
  return await fetchUserData(clerk_id, token, filters);
};
