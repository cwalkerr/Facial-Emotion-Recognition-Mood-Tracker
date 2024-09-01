import datetime
from sqlalchemy import TIME, TIMESTAMP, ForeignKey, String
from sqlalchemy.orm import DeclarativeBase
from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column


# Define the DB tables and their columns

class Base(DeclarativeBase):
    type_annotation_map = {
        datetime.datetime: TIMESTAMP(timezone=True),
        datetime.time: TIME(timezone=False),
    }

class User(Base):
    __tablename__ = "users"
    
    user_id: Mapped[int] = mapped_column(primary_key=True)
    clerk_id: Mapped[str] = mapped_column(String(255))
    notification_start_time: Mapped[Optional[datetime.time]] 
    notification_end_time: Mapped[Optional[datetime.time]]

class Reading(Base):
    __tablename__ = "readings"
    
    reading_id: Mapped[int] = mapped_column(primary_key=True)
    datetime: Mapped[datetime.datetime]
    note: Mapped[Optional[str]]
    location_id: Mapped[Optional[int]] = mapped_column(ForeignKey('locations.location_id'))
    emotion_id: Mapped[int] = mapped_column(ForeignKey('emotions.emotion_id'))
    clerk_id: Mapped[str] = mapped_column(String(255), ForeignKey('users.clerk_id'))
    

class Emotion(Base):
    __tablename__ = "emotions"
    
    emotion_id: Mapped[int] = mapped_column(primary_key=True)
    label: Mapped[str] = mapped_column(String(50))

class Location(Base):
    __tablename__ = "locations"
    
    location_id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))

class GlobalAccuracyCount(Base):
    __tablename__ = "global_accuracy_count"
    
    count_id: Mapped[int] = mapped_column(primary_key=True)
    accurate_readings: Mapped[int]    
    failed_readings: Mapped[int]


    
    