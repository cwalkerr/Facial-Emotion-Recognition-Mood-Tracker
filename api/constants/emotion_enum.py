import enum

class Emotions(enum.Enum):
    ANGRY = 0
    DISGUSTED = 1
    SCARED = 2
    HAPPY = 3
    NEUTRAL = 4
    SAD = 5
    SURPRISED = 6
    
    def __str__(self):
        return self.name.capitalize()