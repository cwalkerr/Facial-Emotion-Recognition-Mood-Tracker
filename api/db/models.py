import datetime
import enum
from sqlalchemy import TIME, TIMESTAMP, ForeignKey, String
from sqlalchemy.orm import DeclarativeBase
from typing import List, Optional
from sqlalchemy.orm import Mapped, mapped_column, relationship

# Define the DB tables and their columns

class Base(DeclarativeBase):
    type_annotation_map = {
        datetime.datetime: TIMESTAMP(timezone=True),
        datetime.time: TIME(timezone=True),
    }

class EmotionEnum(enum.Enum):
    HAPPY = 1
    SAD = 2
    ANGRY = 3
    SCARED = 4
    SURPRISED = 5
    DISGUSTED = 6
    NEUTRAL = 7
    
    def __str__(self):
        return self.name.capitalize()

class LocationEnum(enum.Enum):
    HOME = 'Home'
    WORK = 'Work'
    SCHOOL = 'School'
    GYM = 'Gym'
    RESTAURANT = 'Restaurant'
    OUTDOORS = 'Outdoors'
    COMMUTE = 'Commute'
    VACATION = 'Vacation'
    
class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column('user_id', primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    password: Mapped[str]
    notification_start_time: Mapped[datetime.time]
    notification_end_time: Mapped[datetime.time]

class Reading(Base):
    __tablename__ = "readings"
    
    id: Mapped[int] = mapped_column('reading_id', primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    emotion: Mapped[EmotionEnum]
    datetime: Mapped[datetime.datetime]
    location: Mapped[Optional[LocationEnum]]
    note: Mapped[Optional[str]]


class GlobalAccuracyCount(Base):
    __tablename__ = "global_accuracy_count"
    
    id: Mapped[int] = mapped_column('count_id', primary_key=True)
    accurate_readings: Mapped[int]
    failed_readings: Mapped[int]



    
    