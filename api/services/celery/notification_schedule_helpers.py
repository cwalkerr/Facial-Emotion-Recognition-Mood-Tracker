import random
from datetime import datetime, timedelta, timezone

# Helper Functions for Notification Scheduling, used by the Celery tasks

# convert to a datetime object with today's date      
def iso_time_to_datetime_with_todays_date(iso_time: str) -> datetime:
    parsed_time = datetime.strptime(iso_time, '%H:%M').time()
    today = datetime.now(timezone.utc).date()
    return datetime.combine(today, parsed_time, tzinfo=timezone.utc)

# generate 3 random notification times between the start and end times in spaced intervals
def get_random_notification_times(start_datetime: datetime, end_datetime: datetime) -> list[datetime]:
    # get the total seconds between the start and end times
    total_seconds = int((end_datetime - start_datetime).total_seconds())
    # divide the total seconds into 3 intervals, ensures the random times are spread out fairly evenly
    interval = total_seconds // 3
    
    notification_times = []
    for i in range(3):
        # calculate the start of each interval
        interval_start = start_datetime + timedelta(seconds=interval * i)
        # generate random seconds within the interval space
        random_seconds = random.randint(0, interval)
        # add the random seconds to the interval start time, producing a random time within the interval
        random_time = interval_start + timedelta(seconds=random_seconds)
        notification_times.append(random_time)
    
    return notification_times

if __name__ == "__main__":
    # test the helper functions
    start_time = "09:00"
    end_time = "17:00"
    start_datetime = iso_time_to_datetime_with_todays_date(start_time)
    end_datetime = iso_time_to_datetime_with_todays_date(end_time)
    print(f"Start Time: {start_datetime}")
    print(f"End Time: {end_datetime}")