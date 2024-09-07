from datetime import timedelta
import requests
import os
from dotenv import load_dotenv
from datetime import datetime
from services.celery.celery_config import celery_app
from services.celery.notification_schedule_helpers import iso_time_to_datetime_with_todays_date, get_random_notification_times

load_dotenv()

# sends a notification to the user through Native Notify API
@celery_app.task(name='services.celery.tasks.send_notification')
def send_notification(clerk_id: str):
    try:
        response = requests.post('https://app.nativenotify.com/api/indie/notification', 
            json={
                'subID': clerk_id,
                'appId': os.getenv('NATIVE_NOTIFY_APP_ID'),
                'appToken': os.getenv('NATIVE_NOTIFY_TOKEN'),
                'title': 'How are you feeling?',
                'message': 'Time to check in on your mood!',
            }
        )
        if response.status_code != 201:
            print(f'Failed to send notification to {clerk_id}: {response.status_code} - {response.text}')
        else:
            print('Notification sent successfully')
    except Exception as e:
        print(f"Error: {str(e)}")
        raise e

# schedules notifications for the user at random times during their time range
@celery_app.task(name='services.celery.tasks.schedule_notifications')
def schedule_notifications(clerk_id: str, start_datetime: datetime, end_datetime: datetime):
    # get 3 new random notification times for the user
    print(f"Getting random notification times for {clerk_id}")
    notification_times = get_random_notification_times(start_datetime, end_datetime)
    print(f"Notification times for {clerk_id}: {notification_times}")
    # schedule a notification task for each of the random times that day
    for notification_time in notification_times:
        send_notification.apply_async(
            args=[clerk_id], 
            eta=notification_time,
            serializer='pickle'
        )
        print(f"Scheduled notification for {clerk_id} at {notification_time.strftime('%H:%M:%S')}")

# schedules notifications for the user at random times during their time range, and schedules the task to run again the next day
@celery_app.task(name='services.celery.tasks.daily_scheduler')
def daily_scheduler(clerk_id: str, start_datetime: datetime, end_datetime: datetime):
    print(f"Executing daily_scheduler for {clerk_id} with start_datetime={start_datetime} and end_datetime={end_datetime}")
    
    # schedule todays notifications for the user
    schedule_notifications(clerk_id, start_datetime, end_datetime)

    # add a day to todays times to get tomorrow's times
    tomorrow_start_time = start_datetime + timedelta(days=1)
    tomorrow_end_time = end_datetime + timedelta(days=1)
    
    # schedule this task to run again at tomorrow's start time
    daily_scheduler.apply_async(
        args=[clerk_id, tomorrow_start_time, tomorrow_end_time], 
        eta=tomorrow_start_time,
        serializer='pickle'
    )
    print(f"Scheduled daily_scheduler for {clerk_id} at {tomorrow_start_time.strftime('%Y-%m-%d %H:%M')}")
    
# format the date and start the user notification scheduler    
def start_user_notification_scheduler(clerk_id: str, start_time: str, end_time: str):
    try:
        print(f"Starting user notification scheduler for {clerk_id} with start_time={start_time} and end_time={end_time}")
        # convert the user's start and end times to datetime objects with today's date
        start_datetime = iso_time_to_datetime_with_todays_date(start_time)
        end_datetime = iso_time_to_datetime_with_todays_date(end_time)
        # start the scheduler for the user
        daily_scheduler(clerk_id, start_datetime, end_datetime)
        print(f"Applied daily_scheduler task for {clerk_id}")
    except Exception as error:
        print(f"Failed to start user notification scheduler for {clerk_id}: {error}")        
        

# test functions with worker

def test_schedule_notifications():
    clerk_id = 'user_2lQF4rzaQnsst56zUbVxfTnHuth' # test user
    start_datetime = datetime.now()
    end_datetime = start_datetime + timedelta(hours=8)
    schedule_notifications(clerk_id, start_datetime, end_datetime)

def test_daily_scheduler():
    clerk_id = 'user_2lQF4rzaQnsst56zUbVxfTnHuth'
    start_datetime = datetime.now()
    end_datetime = start_datetime + timedelta(hours=8)
    daily_scheduler(clerk_id, start_datetime, end_datetime)


def test_send_notification():
    clerk_id = 'user_2lRbgolJz67jaNXPxu3oaEiCSmA'
    send_notification.apply_async(args=[clerk_id])

def test_start_user_notification_scheduler():
    clerk_id = 'user_2lQF4rzaQnsst56zUbVxfTnHuth'
    start_time = '09:00'
    end_time = '17:00'
    start_user_notification_scheduler(clerk_id, start_time, end_time)

if __name__ == "__main__":
    # uncomment the function you want to test, running test_start_user_notification_scheduler() will run everything, or test each function individually

    # test_send_notification()
    # test_schedule_notifications()
    # test_daily_scheduler()
    test_start_user_notification_scheduler()