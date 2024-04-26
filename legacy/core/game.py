from helpers.shouldHappenWithProbability import shouldHappenWithProbability
from direction import Direction
from piece import Piece
from board import Board


class Game:
    board: Board

    def __init__(self) -> None:
        """Inits the game"""
        self.board = Board()

    """
    Random generation functions
    """

    def shouldBeFour(self) -> bool:
        """Defines the chance of getting a new 4 into the game."""
        return shouldHappenWithProbability(10)  # 10% probability

    """
    Game dynamic functions
    """

    def insertNewPiece(self) -> bool:
        """Creates a new `2` (or `4`) into the board. Returns `True` if successful or `False` otherwise."""
        newNumber = 2
        if (self.shouldBeFour()):
            newNumber = 4

        (newNumberXPos, newNumberYPos) = self.board.findRandomAvailableSpot()

        if (newNumberXPos == -1 and newNumberYPos == -1):
            return False

        self.board.insertPiece(
            (newNumberXPos, newNumberYPos),
            Piece(newNumber)
        )

        return True

    def movePiecesTo(self, direction: Direction) -> None:
        """Execute the movement of pieces to a specific direction."""
        """
        Possibilites:
        1. No pieces above => move all pieces up
        2. There's a non-combined piece above => if equal, combine; if not, keep them together
        3. There's a combined piece above => only keep them together
        """
        if direction == Direction.UP:
            for j in range(4):
                # Combine first
                for i in range(3):  # not until the last to respect bounds
                    if self.board.getPiece((i, j)).number == 0:
                        pass

                    pieceAbove = self.board.getPiece((i, j))
                    pieceBelow = self.board.getPiece((i-1, j))
                    if pieceAbove.isCombined is False and pieceBelow.isCombined is False and pieceAbove.number == pieceBelow.number:
                        self.board.insertPiece(
                            (i, j),
                            Piece(pieceAbove.number * 2, True)
                        )

                        self.board.removePiece((i-1, j))

                # Move later
                # not until the last because the last one is irrelevant
                for iSpotCandidate in range(3):
                    if self.board.getPiece((iSpotCandidate, j)).number != 0:
                        continue

                    for iMovableSpot in range(iSpotCandidate+1, 4):
                        """
                        Continuar daqui: 
                        - mover todas as peças com número != 0 para cima
                        - repetir lógica para todas as direções (de forma genérica)
                        """
                        # nextSpot = i
                        # continue

        self.board.resetCombinationsState()
