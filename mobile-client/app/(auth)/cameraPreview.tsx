import { CameraView, useCameraPermissions } from 'expo-camera';
import { Href, Link, router } from 'expo-router';
import React from 'react';
import { Pressable, Text, ActivityIndicator, Alert, Platform } from 'react-native';
import CameraFAB from '@/components/ui/CameraFab';
import { View } from 'react-native';
import * as Linking from 'expo-linking';
import { Button, ButtonText } from '@/components/ui/gluestack-imports/button';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { PredictionResponse, uploadPhoto } from '@/services/api/uploadPhoto';
import { useAuth } from '@clerk/clerk-expo';
import { ErrorResponse } from '@/services/api/customFetch';

/**
 * Camera Component
 * used to display the camera preview, take photos and handle permissions
 */
export default function Camera(): React.JSX.Element {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [pictureSize, setPictureSize] = useState<string | undefined>(undefined);
  const [enableButton, setEnableButton] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const { getToken } = useAuth();

  // checks if permissions are granted on mount, and if not, requests them
  const handlePermissions = useCallback(async (): Promise<void> => {
    if (!permission) return; // permission object is not available yet - useEffect will call again when it is

    if (!permission.granted && permission.canAskAgain) {
      await requestPermission(); // this will opem the device specific permission screen
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    handlePermissions();
  }, [permission, handlePermissions]);

  // get available picture sizes when camera is ready, set the closest size to 1280x720
  // reduces the size of the image for b64 encoding and haarcascades for face detection, while retaining quality
  // the sizes are returned by expo-camera in landscape, but are oriented as portrait after taking picture regardless
  useEffect(() => {
    const getPictureSizes = async (): Promise<void> => {
      let chosenSize: string = '';

      if (cameraRef.current) {
        const sizes = await cameraRef.current.getAvailablePictureSizesAsync();

        if (!sizes) return; // not sure if this would ever happen, but would prevent pictureSize from empty string

        for (const size of sizes) {
          if (size === '1280x720' || size === '640x480') {
            // take either of these if available, first prefered, array starts with largest size - 640x480 not tested so may not be great
            chosenSize = size;
            break;
          }
        }
        if (!chosenSize) {
          chosenSize = getClosestSize(sizes, 1280, 720); // if neither of the above are available, get the closest size
        }
      }
      setPictureSize(chosenSize);
    };
    if (cameraRef.current && isCameraReady) {
      getPictureSizes();
    }

    // move this to seperate file? it is part of the useEffect though?
    const getClosestSize = (
      sizes: string[],
      desiredWidth: number,
      desiredHeight: number
    ): string => {
      let closestSize: string = '';
      let closestDifference: number = Infinity;

      for (const size of sizes) {
        const [width, height] = size.split('x').map(Number); // "1280x720" -> [1280, 720]
        const difference =
          Math.abs(width - desiredWidth) + Math.abs(height - desiredHeight);

        // find the size with the smallest difference to 1280x720
        if (difference < closestDifference) {
          closestDifference = difference;
          closestSize = size;
        }
      }
      return closestSize;
    };
  }, [isCameraReady, setPictureSize]);

  // permissions still loading after request, return loading spinner
  if (!permission) {
    return <ActivityIndicator size={'large'} />;
  }

  // permisssions have not been granted, show a message with instructions:
  // permissions not specifically denied -> request them again
  // otherwise, permissions must be handled in the device settings
  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center align-center items-center">
        <Text>
          Camera permissions are required to use this app.{' '}
          {permission.canAskAgain
            ? 'Please grant them.'
            : 'Please enable them in the settings.'}
        </Text>
        <Button
          className="mt-4 rounded-md"
          onPress={() => {
            if (permission.canAskAgain) {
              handlePermissions();
            } else {
              Linking.openSettings();
            }
          }}>
          <ButtonText>
            {permission.canAskAgain ? 'Grant Permissions' : 'Open Settings'}
          </ButtonText>
        </Button>
      </View>
    );
  }
  // takes a photo of the current camera view
  const takePhoto = async (): Promise<void> => {
    let response: PredictionResponse | ErrorResponse;
    if (cameraRef.current && isCameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
        });
        if (photo && photo.base64) {
          const token = await getToken();
          if (!token) {
            throw new Error('No token found');
          }
          response = await uploadPhoto(photo.base64, token); // send the photo to the server for prediction
        } else {
          throw new Error('No photo taken');
        }
        // Check if response is an instance of ErrorResponse
        if ('error' in response) {
          if (response.error.includes('No face detected')) {
            Alert.alert('No Face Detected', response.error);
          } else {
            Alert.alert('Error', response.error); // api returns user friendly error messages
          }
        } else {
          // navigate to results page with the emotion as a parameter
          router.push(`/results?emotion=${response.prediction}` as Href);
        }
      } catch (error) {
        console.error('Error taking photo:', error);
        Alert.alert('Error', 'Failed to take photo, please try again');
      }
    } else {
      Alert.alert('Error', 'Camera not ready, please try again'); // precaution, button should be disabled if camera not ready
    }
  };

  const onCameraReady = () => {
    setIsCameraReady(true);
    setTimeout(() => {
      // enable the button after the camera is ready with delay, onCameraReady callback is called before the camera is actually ready
      // causing errors if photo is taken immediately
      setEnableButton(true);
      // setting IsCameraReady(true) after the delay causes a stutter in the camera view, so adding button state is a workaround
    }, 700); // not sure how well 700 works on all devices, but it works on the devices I have tested - dont want to make it longer than absolutely necessary
    // switching to react-native-vision-camera may solve this as its more performant
  };

  return (
    <View className="flex-1 relative">
      <CameraView
        style={{ flex: 1 }} // nativewind styling does not work with CameraView
        facing="front"
        flash="auto"
        autofocus="on"
        ref={cameraRef}
        onCameraReady={onCameraReady}
        {...(pictureSize && { pictureSize })} // only pass pictureSize if it is defined, when undefined it will use the default size
      />
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 100}
        experimentalBlurMethod="dimezisBlurView" // allows the blur to work on Android - in testing, its not as good as on iOS need to find a better solution
        className="absolute top-0 left-0 w-full h-full"
      />
      <Text className="text-xl text-semiboold text-white bg-transparent absolute top-10 right-12 mr-10 mt-4">
        Keep your face within the box
      </Text>
      <View className="absolute ml-14 mt-24 top-1/8 left-1/8 w-3/4 h-3/4 border-2 border-green-500 rounded-3xl bg-transparent" />

      {/* Back icon */}
      <Link href="/" asChild className="absolute top-14 left-4">
        <Pressable>
          <ArrowLeft color={'white'} size={36} />
        </Pressable>
      </Link>
      {/* Button for taking photo - disabled if camera not ready to
      prevent uneccessary user action and confusion */}
      <CameraFAB onPress={takePhoto} disabled={!enableButton} />
    </View>
  );
}
