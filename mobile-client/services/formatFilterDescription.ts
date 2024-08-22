import { Location } from '@/constants/Locations';

// Text for top of chart to describe the current filter
const formatFilterDescription = (timeframe: string, location?: Location): string => {
  // grammatorically correct descriptions for each location
  const locationDescriptions: { [key in Location]: string } = {
    [Location.Home]: 'at Home',
    [Location.Work]: 'at Work',
    [Location.School]: 'at School',
    [Location.Gym]: 'at the Gym',
    [Location.Restaurant]: 'in Restaurants',
    [Location.Outdoors]: 'When Outdoors', // capitalise When because i think it looks better
    [Location.Commute]: 'When Commuting',
    [Location.Vacation]: 'on Vacation',
    [Location.Shopping]: 'When Shopping',
  };

  // if all time and location, just return the location, otherwise just All Time
  if (timeframe === 'All Time') {
    return location ? Location[location] : 'All Time';
  }
  // if location is defined, return the location description with the timeframe otherwise just the timeframe
  return location ? `${timeframe} ${locationDescriptions[location]}` : timeframe;
};

export default formatFilterDescription;
