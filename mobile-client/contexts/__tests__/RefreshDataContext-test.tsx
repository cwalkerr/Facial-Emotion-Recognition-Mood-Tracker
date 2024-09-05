// import React from 'react';
// import { render, waitFor, screen } from '@testing-library/react-native';
// import { Alert, Text } from 'react-native';
// import {
//   UserDataStateProvider,
//   useUserDataContext,
//   UserDataContext,
// } from '../RefreshDataContext';
// import { fetchWeeklyData } from '@/services/api/userDataUtils';
// import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
// import { EmotionReading } from '@/services/api/fetchUserData';

/**
 *
 *
 * Trouble mocking the ClerkProvider and using UserDataStateProvider
 *
 *
 */

// jest.mock('@clerk/clerk-expo', () => ({
//   useAuth: jest.fn(),
//   ClerkProvider: jest.fn(),
// }));

// jest.mock('@/services/api/userDataUtils', () => ({
//   fetchWeeklyData: jest.fn(),
// }));

// jest.spyOn(Alert, 'alert');

// const mockFetchWeeklyData = fetchWeeklyData as jest.Mock;
// const mockUseAuth = useAuth as jest.Mock;

// const TestChild = () => {
//   const { userData } = useUserDataContext();

//   if (!userData) {
//     console.log('userData is null');
//     return null;
//   }

//   return (
//     <>
//       <Text>{userData.readings[0].id.toString()}</Text>
//       <Text>{userData.readings.length}</Text>
//     </>
//   );
// };

// describe('UserDataContextProvider', () => {
//   it('fetches user data and todays readings, then sets in state', async () => {
//     const mockUserData = {
//       readings: [
//         { id: 6, emotion: 'Disgusted', datetime: '2024-01-10', note: 'note' },
//         { id: 7, emotion: 'Surprised', datetime: '2024-01-10', note: 'note' },
//       ],
//       counts: {
//         Angry: 1,
//         Disgusted: 2,
//         Scared: 3,
//         Happy: 4,
//         Neutral: 5,
//         Sad: 6,
//         Surprised: 7,
//       },
//     };

//     const { rerender } = render(
//       <ClerkProvider
//         publishableKey="testKey"
//         tokenCache={{
//           getToken: jest.fn().mockResolvedValue('mockToken'),
//           saveToken: jest.fn().mockResolvedValue(undefined),
//           clearToken: jest.fn().mockResolvedValue(undefined),
//         }}>
//         <UserDataStateProvider>
//           <TestChild />
//         </UserDataStateProvider>
//       </ClerkProvider>
//     );

//     mockFetchWeeklyData.mockResolvedValue(mockUserData);

//     const mockTodaysReadings: EmotionReading[] = [mockUserData.readings[0]];
//     const mockContextValue = {
//       userData: mockUserData,
//       setUserData: jest.fn(),
//       todaysReadings: mockTodaysReadings,
//     };

//     // Re-render to reflect state change
//     rerender(
//       <ClerkProvider
//         publishableKey="testKey"
//         tokenCache={{
//           getToken: jest.fn().mockResolvedValue('mockToken'),
//           saveToken: jest.fn().mockResolvedValue(undefined),
//           clearToken: jest.fn().mockResolvedValue(undefined),
//         }}>
//         <UserDataContext.Provider value={mockContextValue}>
//           <TestChild />
//         </UserDataContext.Provider>
//       </ClerkProvider>
//     );

//     await waitFor(() => {
//       expect(screen.getByText('6')).toBeTruthy();
//     });

//     await waitFor(() => {
//       expect(screen.getByText('2')).toBeTruthy();
//     });
//   });

//   it('displays the responses error message if api error', async () => {
//     mockUseAuth.mockReturnValue({
//       getToken: jest.fn().mockResolvedValue('token'),
//       userId: '123',
//     });
//     mockFetchWeeklyData.mockRejectedValue({
//       error: 'error',
//     });

//     const mockTokenCache = {
//       getToken: jest.fn().mockResolvedValue('mockToken'),
//       saveToken: jest.fn().mockResolvedValue(undefined),
//       clearToken: jest.fn().mockResolvedValue(undefined),
//     };

//     render(
//       <ClerkProvider publishableKey={'testKey'} tokenCache={mockTokenCache}>
//         <UserDataStateProvider>
//           <TestChild />
//         </UserDataStateProvider>
//       </ClerkProvider>
//     );

//     await waitFor(() => {
//       expect(Alert.alert).toHaveBeenCalledWith('Error', 'error');
//     });
//   });
// });
