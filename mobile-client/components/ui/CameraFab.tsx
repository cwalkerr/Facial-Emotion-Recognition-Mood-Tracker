import React from 'react';
import { Fab } from '@/components/ui/gluestack-imports/fab';
import { Camera } from 'lucide-react-native';

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
const CameraFAB: React.FC<CameraFABProps> = ({ onPress, disabled = false }) => {
  return (
    <Fab
      className="rounded-full mb-12 w-20 bg-custom-primary active:bg-custom-base h-20 shadow-lg"
      placement="bottom center"
      onPress={onPress}
      disabled={disabled}>
      {/* Camera Icon */}
      <Camera size={32} color={'white'} strokeWidth={1.5} />
    </Fab>
  );
};

export default CameraFAB;
