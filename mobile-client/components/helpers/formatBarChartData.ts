import getEmoji from '../helpers/getEmoji';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { EmotionBarChartProps } from '../ui/EmotionBarChart';

export const Bars = ({ counts }: EmotionBarChartProps) => {
  const emotions = Object.keys(counts);
  // map over keys of counts to access the values and create the bars labels, colours and values
  const bars = emotions.map(emotion => {
    const frontColor = Colors[emotion.toUpperCase()];
    return {
      value: counts[emotion],
      labelComponent: () =>
        getEmoji({
          emotion: emotion,
          height: Sizes.BAR_CHART_LABEL_SIZE,
          width: Sizes.BAR_CHART_LABEL_SIZE,
        }),
      frontColor: frontColor,
    };
  });
  return bars;
};
