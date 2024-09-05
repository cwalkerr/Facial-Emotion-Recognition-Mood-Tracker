import pytest
from datetime import datetime, timezone, time
from services.celery.notification_schedule_helpers import get_random_notification_times, iso_time_to_datetime_with_todays_date

@pytest.fixture
def today():
    return datetime.now(timezone.utc).date()

def test_iso_time_to_datetime_with_todays_date_valid_time(today):
    iso_time = "14:30"
    result = iso_time_to_datetime_with_todays_date(iso_time)
    expected_datetime = datetime.combine(today, time(14, 30), tzinfo=timezone.utc)
    
    assert result == expected_datetime

def test_iso_time_to_datetime_with_todays_date_midnight(today):
    iso_time = "00:00"
    result = iso_time_to_datetime_with_todays_date(iso_time)
    expected_datetime = datetime.combine(today, time(0, 0), tzinfo=timezone.utc)
    
    assert result == expected_datetime

def test_iso_time_to_datetime_with_todays_date_invalid_format(today):
    iso_time = "invalid_time"
    
    with pytest.raises(Exception):
        iso_time_to_datetime_with_todays_date(iso_time)

def test_iso_time_to_datetime_with_todays_date_border(today):
    iso_time = "23:59"
    result = iso_time_to_datetime_with_todays_date(iso_time)
    
    expected_datetime = datetime.combine(today, time(23, 59), tzinfo=timezone.utc)
    
    assert result == expected_datetime

def test_there_are_3_notification_times_generated():
    start_datetime = datetime(2023, 1, 1, 9, 0, 0)
    end_datetime = datetime(2023, 1, 1, 17, 0, 0)
    
    notification_times = get_random_notification_times(start_datetime, end_datetime)
    
    assert len(notification_times) == 3

def test_get_random_notification_times_within_range():
    start_datetime = datetime(2023, 1, 1, 9, 0, 0)
    end_datetime = datetime(2023, 1, 1, 17, 0, 0)
    
    notification_times = get_random_notification_times(start_datetime, end_datetime)
    
    assert all(start_datetime <= time <= end_datetime for time in notification_times), "notification time should be within the start and end datetime range"
    
def test_get_random_notification_times_spaced_out():
    start_datetime = datetime(2023, 1, 1, 9, 0, 0)
    end_datetime = datetime(2023, 1, 1, 21, 0, 0)
    
    notification_times = get_random_notification_times(start_datetime, end_datetime)
    
    intervals = []

    for i in range(len(notification_times) - 1):
        interval = notification_times[i + 1] - notification_times[i]
        interval_seconds = interval.total_seconds()
        intervals.append(interval_seconds)
    
    total_seconds = (end_datetime - start_datetime).total_seconds()
    expected_interval = total_seconds / 3

    for interval in intervals:
        assert interval > 0, "intervals should be greater than 0"
        assert abs(interval - expected_interval) <= expected_interval, "Interval should be within a respectable range"
        
def test_get_random_notification_times_border():
    start_datetime = datetime(2023, 1, 1, 9, 0, 0)
    end_datetime = datetime(2023, 1, 1, 9, 0, 3)  # only 3 seconds apart
    
    notification_times = get_random_notification_times(start_datetime, end_datetime)
    
    assert len(notification_times) == 3, "should return exactly 3 notification times even for short intervals"
    assert all(start_datetime <= time <= end_datetime for time in notification_times), "notification time should be within the start and end datetime range"

def test_get_random_notification_times_invalid_range():
    start_datetime = datetime(2023, 1, 1, 17, 0, 0)
    end_datetime = datetime(2023, 1, 1, 9, 0, 0)  # end before start
    
    with pytest.raises(Exception):
        get_random_notification_times(start_datetime, end_datetime)



