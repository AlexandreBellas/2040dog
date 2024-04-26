from helpers.randomInteger import randomInteger
from piece import Piece


class Board:
    table: list[list[Piece]]

    def __init__(self):
        """Initializes the board."""
        self.prepareBoard()

    """
    Initialization methods
    """

    def prepareBoard(self) -> None:
        """Prepares the board for the game => creates the full matrix."""
        for i in range(4):
            self.table.append([Piece(0), Piece(0), Piece(0), Piece(0)])

    """
    Helpers methods
    """

    def randomAxisPosition(self) -> int:
        """Creates a new integer between 0 and 3."""
        return randomInteger(0, 3)

    def isFull(self) -> bool:
        """Informs if the board is full."""
        for i in range(4):
            for j in range(4):
                if self.board[i][j].number == 0:
                    return False

        return True

    def getPiece(self, position: tuple[int, int]) -> Piece:
        """Obtains a piece from the respective position."""
        (x, y) = position
        return self.table[x][y]

    def insertPiece(self, position: tuple[int, int], piece: Piece) -> None:
        """Inserts a new piece into the board."""
        (x, y) = position
        self.table[x][y] = piece

    def removePiece(self, position: tuple[int, int]) -> None:
        """Removes a piece by inserting one with value 0."""
        (x, y) = position
        self.table[x][y] = Piece(0)

    """
    Dynamics methods
    """

    def resetCombinationsState(self) -> None:
        """Resets the combination state in each piece of the board."""
        for i in range(4):
            for j in range(4):
                self.table[i][j].isCombined = False

    def findRandomAvailableSpot(self) -> tuple[int, int]:
        """Finds a spot for new pieces. Returns `(-1, -1)` if there is no available."""
        if (self.isFull()):
            return (-1, -1)

        while True:
            newNumberXPosCandidate = self.randomAxisPosition()
            newNumberYPosCandidate = self.randomAxisPosition()

            if self.table[newNumberXPosCandidate][newNumberYPosCandidate].number != 0:
                return (newNumberXPosCandidate, newNumberYPosCandidate)
