import { CameraView, useCameraPermissions } from 'expo-camera';
import { Href, Link, router } from 'expo-router';
import React from 'react';
import { Pressable, Text, ActivityIndicator, Alert } from 'react-native';
import CameraFAB from '@/components/CameraFab';
import { View } from 'react-native';
import * as Linking from 'expo-linking';
import { Button, ButtonText } from '@/components/ui/button';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import uploadPhoto from '@/services/api/uploadPhoto';
import { useAuth } from '@clerk/clerk-expo';

/**
 * Camera Component
 * used to display the camera preview, take photos and handle permissions
 */
export default function Camera(): React.JSX.Element {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [pictureSize, setPictureSize] = useState<string | undefined>(undefined);
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
    return <ActivityIndicator size={'small'} />;
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

  // sets camera to ready once it loads
  const onCameraReady = () => {
    setIsCameraReady(true);
  };

  // takes a photo of the current camera view
  const takePhoto = async (): Promise<void> => {
    let response;
    if (cameraRef.current) {
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
        // 'error' is a string returned by the uploadPhoto, probably a better way to handle this
        if (response.prediction !== 'error') {
          // navigate to results page with the emotion as a parameter - no need for state for this
          router.push(`/results?emotion=${response.prediction}` as Href);
        } else {
          Alert.alert('Error', 'Failed to retrieve prediction, please try again');
        }
      } catch (error) {
        console.error('Error taking photo: ', error); // TODO: improve error handling
      }
    }
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
        intensity={80}
        experimentalBlurMethod="dimezisBlurView" // allows the blur to work on Android - in testing, its not as good as on iOS need to find a better solution
        className="absolute top-0 left-0 w-full h-full"
      />
      {/* Back icon */}
      <Link href="/" asChild className="absolute top-14 left-8">
        <Pressable>
          <ArrowLeft color={'white'} size={36} />
        </Pressable>
      </Link>
      {/* Button for taking photo - disabled if camera not ready to
      prevent uneccessary user action and confusion */}
      <CameraFAB onPress={takePhoto} disabled={!isCameraReady} />
    </View>
  );
}
