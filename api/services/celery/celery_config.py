from celery import Celery
# Celery app configuration for scheduling notifications
celery_app = Celery('notifications',
             broker='amqp://guest:guest@localhost:5672//', # RabbitMQ broker
             backend='rpc://', # RPC backend for results
             include=['services.celery.tasks']) # tasks module, look here to find the tasks that are run

celery_app.conf.update(
    task_serializer='pickle',
    result_serializer='pickle',
    accept_content=['pickle', 'json'], # uses pickle but issues without accepting json
    # additional configuration
    task_acks_late=True, 
    worker_prefetch_multiplier=1,
    worker_concurrency=4,
    task_time_limit=300,
    task_soft_time_limit=240,  
)