import React from 'react';
import { Fab } from '@/components/ui/gluestack-imports/fab';
import { Camera } from 'lucide-react-native';
import { Platform } from 'react-native';

// add props to fab
interface CameraFABProps {
  onPress: () => void;
  disabled?: boolean;
}

/**
 * This is the primary action button,
 * it is used both to open the camera and to take a picture.
 * @returns Floating action button with camera icon
 */
const CameraFAB = ({
  onPress,
  disabled = false,
}: CameraFABProps): React.JSX.Element => {
  return (
    <Fab
      // the positioning of the tabs bars is different on ios and android, ios has a larger margin - this seems to be independent of the screen size
      className={`rounded-full w-20 bg-custom-primary active:bg-custom-base h-20 shadow-lg ${Platform.OS === 'ios' ? 'mb-12' : 'mb-4'}`}
      placement="bottom center"
      onPress={onPress}
      disabled={disabled}>
      {/* Camera Icon */}
      <Camera size={32} color={'white'} strokeWidth={1.5} />
    </Fab>
  );
};

export default CameraFAB;
