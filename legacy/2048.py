from core.game import Game

game = Game()

while True:
    print(game.board)
    game.insertNewPiece()

    typed = input("Press enter to continue...")

    if typed == "stop":
        break
