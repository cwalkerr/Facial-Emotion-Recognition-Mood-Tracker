interface ColorsType {
  HAPPY: string;
  NEUTRAL: string;
  SAD: string;
  ANGRY: string;
  SURPRISED: string;
  SCARED: string;
  DISGUSTED: string;
  [key: string]: string; // allows for string indexing
}

export const Colors: ColorsType = {
  HAPPY: '#7CFB79',
  NEUTRAL: '#FBE76F',
  SAD: '#8FDEFF',
  ANGRY: '#F45569',
  SURPRISED: '#EE9AFC',
  SCARED: '#FF8F8F',
  DISGUSTED: '#549B75',
};
