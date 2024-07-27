import { Fab } from "./ui/fab";
import { Camera } from "lucide-react-native";
/**
 * This is the primary action button,
 * it is used both to open the camera and to take a picture.
 * @returns Floating action button with camera icon
 */
const CameraFAB: React.FC = () => {
  return (
    <Fab
      className="rounded-full mb-12 w-20 h-20 shadow-lg"
      placement="bottom center"
    >
      {/* Camera Icon */}
      <Camera size={32} color={"white"} strokeWidth={1.5} />
    </Fab>
  );
};

export default CameraFAB;
