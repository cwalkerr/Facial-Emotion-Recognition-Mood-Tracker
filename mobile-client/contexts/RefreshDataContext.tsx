import React, { createContext, useState, useContext } from 'react';
import { ReadingsResponse } from '@/services/api/fetchUserData';

// defines the types of the context/states values - UserDataResponse = (array of emotion readings)
interface RefreshDataContextProps {
  isFromResults: boolean;
  setIsFromResults: React.Dispatch<React.SetStateAction<boolean>>;
  userData: ReadingsResponse | null;
  setUserData: React.Dispatch<React.SetStateAction<ReadingsResponse | null>>;
}

// create context, undefined initial value
const RefreshDataContext = createContext<RefreshDataContextProps | undefined>(
  undefined
);

// State provider component - wraps the tabs layout so those screens know to refresh when coming from results
export const RefreshDataStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // state to track if user came from results
  const [isFromResults, setIsFromResults] = useState<boolean>(false);
  const [userData, setUserData] = useState<ReadingsResponse | null>(null);

  return (
    <RefreshDataContext.Provider
      value={{ isFromResults, setIsFromResults, userData, setUserData }}>
      {children}
    </RefreshDataContext.Provider>
  );
};

// custom hook to use the context within the required components
export const useRefreshDataContext = () => {
  const context = useContext(RefreshDataContext);
  if (!context) {
    throw new Error('Trying to useStateContext outwith a StateProvider'); // throw error if outwith provider
  }
  return context;
};
