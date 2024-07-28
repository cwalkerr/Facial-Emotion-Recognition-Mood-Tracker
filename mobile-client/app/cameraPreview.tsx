import { CameraView, useCameraPermissions } from "expo-camera";
import { Link } from "expo-router";
import { Pressable, Text } from "react-native";
import CameraFAB from "@/components/CameraFab";
import { View } from "react-native";
import * as Linking from "expo-linking";
import { Button, ButtonText } from "@/components/ui/button";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react-native";
import { BlurView } from "expo-blur";

/**
 * Front Facing Camera Preview
 * permissions are handled here before showing the camera preview
 * @returns Camera preview with blurred background if permissions are granted
 */
export default function CameraPreview() {
  // hook provided by expo-camera to request and check permissions
  const [permission, requestPermission] = useCameraPermissions();

  /**
   * Function to handle permissions
   */
  const handlePermissions = async () => {
    if (!permission) return; // return early if permission object is not available yet - useEffect will call again when it is

    if (!permission.granted && permission.canAskAgain) {
      await requestPermission(); // this will opem the device specific permission screen
    }
  };

  // hook to call handlePermissions on mount, or when permission changes
  useEffect(() => {
    handlePermissions();
  }, [permission]);

  // permission object still loading after handlePermissions, return loading spinner
  if (!permission) {
    return <View />; // TODO: add loading spinner
  }

  // if permisssions have not been granted, show a message with instructions:
  // if permissions can be asked again, button will call handlePermissions again (which will open the device permission screen)
  // otherwise, permissions must be handled in the device settings, so button instead opens settings at the apps configuration
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
              : Linking.openSettings(); // open settings on device
          }}
        >
          <ButtonText>
            {permission.canAskAgain ? "Grant Permissions" : "Open Settings"}
          </ButtonText>
        </Button>
      </View>
    );
  }

  // once permissions are granted, show the blurred camera preview
  return (
    <View className="flex-1 relative">
      <CameraView
        style={{ flex: 1 }} // nativewind styling does not work with CameraView
        facing="front"
        flash="auto"
        autofocus="on"
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
    </View>
  );
}
