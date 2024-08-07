import * as React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

const Surprise = props => (
  <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <Rect
      width={22}
      height={22}
      x={1}
      y={1}
      rx={7.656}
      style={{
        fill: '#ee9afc',
      }}
    />
    <Path
      d="M23 13.938a14.69 14.69 0 0 1-12.406 6.531c-5.542 0-6.563-1-9.142-2.529A7.66 7.66 0 0 0 8.656 23h6.688A7.656 7.656 0 0 0 23 15.344z"
      style={{
        fill: '#BB8BC2',
      }}
    />
    <Path
      d="M16.083 12.556A5.487 5.487 0 0 0 12 10.806a5.487 5.487 0 0 0-4.083 1.75c-.959 1.292-.147 2.667.885 2.583s2.781-.285 3.2-.285 2.167.2 3.2.285 1.84-1.291.881-2.583z"
      style={{
        fill: '#510C42',
      }}
    />
    <Path
      d="M13.75 13.266c-1.344-.3-1.75.109-1.75.109s-.406-.406-1.75-.109a2.463 2.463 0 0 0-1.65 1.87 1.1 1.1 0 0 0 .207 0c1.031-.083 2.781-.285 3.2-.285s2.167.2 3.2.285a1.1 1.1 0 0 0 .207 0 2.463 2.463 0 0 0-1.664-1.87z"
      style={{
        fill: '#f06880',
      }}
    />
    <Path
      d="M13.965 15.91a9.842 9.842 0 0 0-1.965-.3 9.842 9.842 0 0 0-1.965.3c-.294.061-.3.3 0 .261s1.965-.13 1.965-.13 1.663.09 1.965.13.294-.2 0-.261z"
      style={{
        fill: '#BB8BC2',
      }}
    />
    <Rect
      width={3.494}
      height={5.764}
      x={5.307}
      y={5.427}
      style={{
        fill: '#510C42',
      }}
      rx={1.5}
    />
    <Rect
      width={3.494}
      height={5.764}
      x={15.21}
      y={5.427}
      style={{
        fill: '#510C42',
      }}
      rx={1.5}
    />
  </Svg>
);

export default Surprise;