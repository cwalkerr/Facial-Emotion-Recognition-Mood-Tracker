import React from 'react';
import { Button, ButtonIcon } from '@/components/ui/gluestack-imports/button';
import { LucideIcon } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

interface IconButtonProps {
  icon: LucideIcon;
  iconStroke?: number;
  iconColor?: string;
  btnStyles?: string;
  iconStyles?: string;
  onPress: () => void;
}

/**
 * circular button with an icon
 * @param icon - The imported LucideIcon to display
 * @param size - The size of the button - default is md
 * @param iconSize - The size of the icon - default is sm
 * @param iconStroke - The stroke width of the icon - default is 1
 * @param iconColor - The color of the icon - default is white
 * @param onPress - The function to call when the button is pressed
 * @returns A button with an icon
 */
const IconButton = ({
  icon,
  iconStroke = 1.5,
  iconColor = 'white',
  btnStyles = 'rounded-full p-2 w-14 h-14 bg-custom-primary active:bg-custom-base',
  iconStyles = 'w-7 h-7',
  onPress,
}: IconButtonProps): React.JSX.Element => {
  return (
    <TouchableOpacity activeOpacity={0.8}>
      <Button className={btnStyles} onPress={onPress}>
        <ButtonIcon
          as={icon}
          strokeWidth={iconStroke}
          color={iconColor}
          className={iconStyles}
        />
      </Button>
    </TouchableOpacity>
  );
};

export default IconButton;
