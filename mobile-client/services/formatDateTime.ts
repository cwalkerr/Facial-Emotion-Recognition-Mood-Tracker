import { format, parseISO } from 'date-fns';

// formats date type to '18th August 2024'
export const formatDate = (date: Date): string => {
  return format(date, 'do MMMM yyyy');
};

// format an iso string into user friendly time
export const formatTime = (isoDate: string): string => {
  const date = parseISO(isoDate);
  return format(date, 'h:mma').toLowerCase(); // i.e. '5:06pm'
};
