import sys
import termios
import tty
import random
import os
import time

class Tetris:
    def __init__(self, rows=20, cols=10):
        self.rows = rows
        self.cols = cols
        self.board = [[0 for _ in range(cols)] for _ in range(rows)]
        self.current_piece = None
        self.running = True

    def render_board(self):
        os.system('clear')
        for row in self.board:
            print('|', end='')
            for cell in row:
                if cell == 0:
                    print(' ', end='')
                else:
                    print('#', end='')
            print('|')
        print('-' * (self.cols + 2))

    def spawn_piece(self):
        self.current_piece = [(0, 4), (1, 4), (2, 4), (3, 4)]  # simple I-shape for demo
        for r, c in self.current_piece:
            self.board[r][c] = 1

    def move_piece_down(self):
        clear_flag = True
        for r, c in self.current_piece:
            if r + 1 == self.rows or self.board[r + 1][c] == 2:
                clear_flag = False
        if clear_flag:
            for r, c in self.current_piece: self.board[r][c] = 0  


# To fill gameLoop for piv something work left stop raw !