class Piece:
    """Class to define a piece in the board."""

    def __init__(self, number: int = 0, isCombined=False):
        self.number = number
        self.isCombined = isCombined
