import { CameraView, useCameraPermissions } from "expo-camera";
import { Link } from "expo-router";
import { Pressable, Text } from "react-native";
import CameraFAB from "@/components/CameraFab";
import { View } from "react-native";
import * as Linking from "expo-linking";
import { Button, ButtonText } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react-native";
import { BlurView } from "expo-blur";

/**
 * Camera Component
 * used to display the camera preview and take a photo
 * also handles permissions
 */
export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  /**
   * Function to handle permissions
   */
  const handlePermissions = async () => {
    if (!permission) return; // return early if permission object is not available yet - useEffect will call again when it is

    if (!permission.granted && permission.canAskAgain) {
      await requestPermission(); // this will opem the device specific permission screen
    }
  };

  // call handlePermissions on mount or when permission changes
  useEffect(() => {
    handlePermissions();
  }, [permission]);

  // permission object still loading after handlePermissions, return loading spinner
  if (!permission) {
    return <View />; // TODO: add loading spinner
  }

  // permisssions have not been granted, show a message with instructions:
  // if permissions can be asked again, button will call handlePermissions again
  // otherwise, permissions must be handled in the device settings
  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center align-center items-center">
        <Text>
          Camera permissions are required to use this app.{" "}
          {permission.canAskAgain
            ? "Please grant them."
            : "Please enable them in the settings."}
        </Text>
        <Button
          className="mt-4 rounded-md"
          onPress={() => {
            permission.canAskAgain
              ? handlePermissions()
              : Linking.openSettings();
          }}
        >
          <ButtonText>
            {permission.canAskAgain ? "Grant Permissions" : "Open Settings"}
          </ButtonText>
        </Button>
      </View>
    );
  }

  // sets camera to ready once it loads
  const onCameraReady = () => {
    setIsCameraReady(true);
  };

  // takes a photo of the current camera view, save the base64 to be sent to the server
  const takePhoto = async () => {
    if (cameraRef.current && isCameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
        });
        console.log(photo?.base64);
      } catch (error) {
        console.error("Error taking photo", error); // TODO: improve error handling
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
      />
      <BlurView
        intensity={80}
        experimentalBlurMethod="dimezisBlurView" // allows the blur to work on Android - experimental so may be better way around this
        className="absolute top-0 left-0 w-full h-full"
      />
      {/* Back icon */}
      <Link href="/" asChild className="absolute top-14 left-8">
        <Pressable>
          <ArrowLeft color={"white"} size={36} />
        </Pressable>
      </Link>
      {/* Button for taking photo - disabled if camera not ready to
      prevent uneccessary user action and confusion */}
      <CameraFAB onPress={takePhoto} disabled={!isCameraReady} />
    </View>
  );
}
