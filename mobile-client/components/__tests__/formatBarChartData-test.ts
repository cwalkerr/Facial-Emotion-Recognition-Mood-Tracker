import { Bars } from '@/components/helpers/formatBarChartData';

describe('Bars component', () => {
  it('should create bars with correct values, and colors', () => {
    const counts = {
      happy: 10,
      sad: 5,
    };

    const bars = Bars({ counts });

    expect(bars).toEqual([
      {
        value: 10,
        labelComponent: expect.any(Function),

        frontColor: '#7CFB79',
      },
      {
        value: 5,
        labelComponent: expect.any(Function),
        frontColor: '#8FDEFF',
      },
    ]);
  });
});
