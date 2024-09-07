# MoodMirror - Mobile App for Facial Emotion Recognition and Mood Tracking

This project leverages facial emotion recognition using a Convolutional Neural Network (CNN) to streamline mood tracking. By automatically detecting emotions from facial expressions, the app aims to reduce the intrusion of self-reporting moods throughout the day.

## Technologies

- Frontend [Expo](https://docs.expo.dev/) Framework for [React Native](https://reactnative.dev/)
- [FastAPI Backend](https://fastapi.tiangolo.com/)
- [PostgreSQL](https://www.postgresql.org/docs/) with [SQLAlchemy](https://www.sqlalchemy.org/)
- CNN running from [TensorFlow Serving](https://www.tensorflow.org/tfx/guide/serving) in [Docker](https://docs.docker.com/)
- [Celery task scheduler](https://docs.celeryq.dev/en/stable/) for random notifications
- [Clerk](https://clerk.dev/docs) for frontend authentication

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/cwalkerr/Facial-Emotion-Recognition-Mood-Tracker.git
   ```

2. Navigate to API
   ```bash
   cd api
   ```
3. Install Backend dependencies
   ```bash
    pip install -r requirements.txt
   ```
4. Start FastAPI
   ```bash
   fastapi dev main.py
   ```
5. Naviagate to the Mobile Client
   ```bash
   cd ..
   cd mobile-client
   ```
6. Install frontend dependencies
   ```bash
   npm install
   ```
7. Start Expo App
   ```bash
   npx expo start
   ```

## Additional Setup Required

### Set up TensorFlow Serving in Docker

- Follow the [TensorFlow Serving guide](https://www.tensorflow.org/tfx/guide/serving) for Docker setup.

### Configure Celery

- Follow the [Celery documentation](https://docs.celeryq.dev/en/stable/) to set up the task scheduler.

### Configure Clerk

- Follow the [Clerk documentation](https://clerk.dev/docs) to integrate authentication.

## Key Files and Directories

- **`api/`**: Contains all the backend code

  - **`main.py`**: The entry point for FastAPI.
  - **`db/`**: Contains SQL queries, DB connection file and ORM models
  - **`endpoints/`**: Contains the endpoints of the API
  - **`services/`**: Includes
    - **`/celery`** for Notification task scheduling files
    - **`forwardToServing.py`** sends images to CNN for prediction

- **`mobile-client/`**: Contains all the frontend code
  - **`app/`**: Contains all route and \_layout files.
    - **`_layout.tsx`**: Route layout, app entry point
  - **`components/`**: Contains JSX components i.e. **`EmotionLineChart.tsx`** and helpers .
  - **`services/`**: Fetch requests, helper functions etc.

## API Docs

    http://localhost:8000/docs

## Usage

- Open the app on your mobile device using Expo.
- Take a selfie when prompted or as needed.
- The app will automatically detect your emotion and record it.
- View your mood history tabs screens!
