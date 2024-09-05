import os
import pytest
from datetime import datetime, timedelta
from unittest.mock import patch
from services.celery.tasks import daily_scheduler, send_notification, schedule_notifications

@pytest.fixture
def mock_requests_post(mocker):
    return mocker.patch('requests.post')

@pytest.fixture
def mock_apply_async(mocker):
    return mocker.patch('celery.Task.apply_async')

@pytest.fixture
def clerk_id():
    return 'user_2lQF4rzaQnsst56zUbVxfTnHuth'

@pytest.fixture
def start_datetime():
    return datetime.now()

@pytest.fixture
def end_datetime(start_datetime):
    return start_datetime + timedelta(hours=8)


def test_send_notification(mock_requests_post, clerk_id):
    mock_requests_post.return_value.status_code = 201
    send_notification(clerk_id)
    # verify that the post request was made with the correct arguments
    mock_requests_post.assert_called_once_with(
        'https://app.nativenotify.com/api/indie/notification',
        json={
            'subID': clerk_id,
            'appId': os.getenv('NATIVE_NOTIFY_APP_ID'),
            'appToken': os.getenv('NATIVE_NOTIFY_TOKEN'),
            'title': 'How are you feeling?',
            'message': 'Time to check in on your mood!',
        }
    )



def test_schedule_notifications(mock_apply_async, clerk_id, start_datetime, end_datetime):
    # get 3 test notification times
    with patch('services.celery.tasks.get_random_notification_times') as mock_get_random_notification_times:
        mock_get_random_notification_times.return_value = [
            start_datetime + timedelta(hours=1),
            start_datetime + timedelta(hours=2),
            start_datetime + timedelta(hours=3)
        ]
        
        schedule_notifications(clerk_id, start_datetime, end_datetime)

        # verify 3 calls have been made and the arguments are correct
        assert mock_apply_async.call_count == 3
        for call in mock_apply_async.call_args_list:
            args, kwargs = call
            assert kwargs['args'] == [clerk_id]
            assert 'eta' in kwargs
            assert kwargs['eta'] in mock_get_random_notification_times.return_value
            assert kwargs['serializer'] == 'pickle'



def test_daily_scheduler(mock_apply_async, clerk_id, start_datetime, end_datetime):
    
    with patch('services.celery.tasks.schedule_notifications') as mock_schedule_notifications:
        daily_scheduler(clerk_id, start_datetime, end_datetime)
        
        # mock the schedule_notifications and verify it was called with the correct arguments
        mock_schedule_notifications.assert_called_once_with(clerk_id, start_datetime, end_datetime)

        # get the arguments passed to the apply_async call
        tomorrow_start_time = start_datetime + timedelta(days=1)
        tomorrow_end_time = end_datetime + timedelta(days=1)

        # verify that daily_scheduler was called again to start at start time with the correct arguments
        mock_apply_async.assert_called_once()
        args, kwargs = mock_apply_async.call_args
        assert kwargs['args'] == [clerk_id, tomorrow_start_time, tomorrow_end_time]
        assert kwargs['eta'] == tomorrow_start_time
        assert kwargs['serializer'] == 'pickle'