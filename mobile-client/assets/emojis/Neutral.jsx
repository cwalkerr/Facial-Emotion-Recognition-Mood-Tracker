import * as React from 'react';
import Svg, { Rect, Path, Ellipse } from 'react-native-svg';

const Neutral = props => (
  <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <Rect
      width={22}
      height={22}
      x={1}
      y={1}
      rx={7.656}
      style={{
        fill: '#fbe76f',
      }}
    />
    <Path
      d="M7.055 7.313A1.747 1.747 0 1 0 8.8 9.059a1.747 1.747 0 0 0-1.745-1.746zm9.903 0A1.747 1.747 0 1 0 18.7 9.059a1.747 1.747 0 0 0-1.742-1.746z"
      style={{
        fill: '#693409',
      }}
    />
    <Path
      d="M23 13.938a14.69 14.69 0 0 1-12.406 6.531c-5.542 0-6.563-1-9.142-2.529A7.66 7.66 0 0 0 8.656 23h6.688A7.656 7.656 0 0 0 23 15.344z"
      style={{
        fill: '#F1D753',
      }}
    />
    <Ellipse
      cx={12}
      cy={13.375}
      style={{
        fill: '#693409',
      }}
      rx={5.479}
      ry={0.297}
    />
    <Ellipse
      cx={12}
      cy={14.646}
      style={{
        fill: '#F1D753',
      }}
      rx={1.969}
      ry={0.229}
    />
  </Svg>
);
export default Neutral;
