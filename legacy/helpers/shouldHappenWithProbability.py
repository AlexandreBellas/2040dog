from random import random


def shouldHappenWithProbability(likelihood: int = 50):
    """Generates a boolean with `likelihood` probability."""
    return random() <= (likelihood / 100)
