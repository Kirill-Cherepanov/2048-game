import animate from './animate.js';

export default class GameBoard {
  constructor(cells, currentScore, bestScore, gameOverHandler) {
    this.score = 0;
    this.currentScore = currentScore;
    this.bestScore = bestScore;
    this.gameOver = gameOverHandler;

    this.ANIMATION = {
      movementduration: 100,
      scaleduration: 100,
      scale: 1.2,
    };
    this.tiles = [[], [], [], []];

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        this.tiles[i][j] = this.#Tile(cells[i * 4 + j]);
      }
    }
  }

  updateScore() {
    this.currentScore.innerText = this.score;

    if (parseInt(localStorage.getItem('2048-best-score')) < this.score) {
      localStorage.setItem('2048-best-score', this.score);
      this.bestScore.innerText = this.score;
    }
  }

  #addTile() {
    const FOUR_TILE_SPAWN_CHANCE = 10; // As in 1 in 10

    let emptyTiles = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.tiles[i][j].value === 0) emptyTiles.push([i, j]);
      }
    }

    if (emptyTiles.length === 0) return;

    let coordinates = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];

    if (Math.floor(Math.random() * (FOUR_TILE_SPAWN_CHANCE + 1)) == FOUR_TILE_SPAWN_CHANCE) {
      this.tiles[coordinates[0]][coordinates[1]].set(4);
    } else this.tiles[coordinates[0]][coordinates[1]].set(2);
  }

  newGame() {
    this.score = 0;
    this.updateScore();

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        this.tiles[i][j].set(0);
      }
    }
    this.#addTile();
    this.#addTile();
  }

  move(direction) {
    return this.#animateMove(...this.#calculateMove(direction));
  }

  #calculateMove(direction) {
    let moves = [];
    let vTiles = this.tiles.map((tileRow) => tileRow.map((tile) => tile.value)); // Virtual tiles (a copy)
    const mergedTiles = [];
    let vScore = this.score;

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        // Определяем порядок проверки доски
        let currentTile;
        switch (direction[0]) {
          case 1:
            currentTile = [i, j];
            break; // Up
          case -1:
            currentTile = [3 - i, j];
            break; // Down
          default:
            switch (direction[1]) {
              case 1:
                currentTile = [j, 3 - i];
                break; // Right
              case -1:
                currentTile = [j, i];
                break; // Left
            }
        }

        // Проверяем наличие плитки на клетке
        if (vTiles[currentTile[0]][currentTile[1]] === 0) {
          continue;
        }

        // Следующая просматриваемая позиция (по направлению движения)
        let nextPos = [currentTile[0] - direction[0], currentTile[1] + direction[1]];

        for (let k = 1; ; nextPos = [currentTile[0] - direction[0] * ++k, currentTile[1] + direction[1] * k]) {
          // Если конец доски, доcки, то оставляем плитку на нем
          if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > 3 || nextPos[1] > 3) {
            if (k === 1) break;

            moves.push([currentTile, k - 1, false]);

            vTiles[nextPos[0] + direction[0]][nextPos[1] - direction[1]] = vTiles[currentTile[0]][currentTile[1]];
            vTiles[currentTile[0]][currentTile[1]] = 0;
          }

          // Если плитка отсутствует, проверяем дальше
          else if (vTiles[nextPos[0]][nextPos[1]] === 0) {
            continue;
          }

          // Объединяем плитки, если они равны по значению
          else if (
            vTiles[nextPos[0]][nextPos[1]] === vTiles[currentTile[0]][currentTile[1]] &&
            !mergedTiles.some((tile) => tile === nextPos.toString())
          ) {
            mergedTiles.push(nextPos.toString());
            moves.push([currentTile, k, true]);

            vTiles[nextPos[0]][nextPos[1]] = vTiles[currentTile[0]][currentTile[1]] * 2;
            vTiles[currentTile[0]][currentTile[1]] = 0;

            vScore += vTiles[nextPos[0]][nextPos[1]];
          }

          // Если плитки не равны, то оставляем первую плитку около второй
          else {
            // Если вторая плитка и так является соседней
            if (k === 1) break;

            moves.push([currentTile, k - 1, false]);

            vTiles[nextPos[0] + direction[0]][nextPos[1] - direction[1]] = vTiles[currentTile[0]][currentTile[1]];
            vTiles[currentTile[0]][currentTile[1]] = 0;
          }

          break;
        }
      }
    }

    return [moves, direction, vTiles, vScore];
  }

  #animateMove(moves, direction, finalValues, newScore) {
    if (moves.length === 0) return true;

    switch (direction[0]) {
      case 1:
        direction = 'bottom';
        break; // Up
      case -1:
        direction = 'top';
        break; // Down
      default:
        switch (direction[1]) {
          case 1:
            direction = 'left';
            break; // Right
          case -1:
            direction = 'right';
            break; // Left
        }
    }
    const width = this.tiles[0][0].cell.getBoundingClientRect().width;
    const gap = width > 90 ? 15 : 10;
    const ANIMATION = this.ANIMATION;
    const board = this;

    animate({
      duration: ANIMATION.movementduration,
      timing(timeFraction) {
        return timeFraction;
      },
      draw(progress) {
        for (let move of moves) {
          const totalDistance = (width + gap) * move[1];

          board.tiles[move[0][0]][move[0][1]].cell.style[direction] = progress * totalDistance + 'px';
        }

        if (progress !== 1) {
          return;
        }

        animate({
          duration: ANIMATION.scaleduration,
          timing(timeFraction) {
            return timeFraction;
          },
          draw(progress) {
            for (let move of moves) {
              if (!move[2]) break;

              board.tiles[move[0][0]][move[0][1]].cell.style.transform = 'scale(' + progress * ANIMATION.scale + ')';
            }

            if (progress !== 1) return;

            animate({
              duration: ANIMATION.scaleduration / 2,
              timing(timeFraction) {
                return timeFraction;
              },
              draw(progress) {
                for (let move of moves) {
                  if (!move[2]) continue;

                  board.tiles[move[0][0]][move[0][1]].cell.style.transform =
                    'scale(' + (ANIMATION.scale - (ANIMATION.scale - 1) * progress) + ')';
                }

                if (progress !== 1) return;

                for (let move of moves) {
                  board.tiles[move[0][0]][move[0][1]].cell.style[direction] = null;

                  board.tiles[move[0][0]][move[0][1]].cell.style.transform = null;
                }

                for (let i = 0; i < 4; i++) {
                  for (let j = 0; j < 4; j++) {
                    board.tiles[i][j].set(finalValues[i][j]);
                  }
                }

                board.score = newScore;
                board.#endTheMove();
              },
            });
          },
        });
      },
    });
  }

  #endTheMove() {
    this.#addTile();
    this.updateScore();

    for (let tileRow of this.tiles) {
      for (let tile of tileRow) {
        if (tile.value === 0) {
          return;
        }
      }
    }

    // Game Over
    if (
      !this.#calculateMove([1, 0])[0].length &&
      !this.#calculateMove([-1, 0])[0].length &&
      !this.#calculateMove([0, 1])[0].length &&
      !this.#calculateMove([0, -1])[0].length
    ) {
      this.gameOver();
    }
  }

  #Tile(cell) {
    let tile = {};
    const COLORS = [
      '',
      '#fae7e0',
      '#f5e6c9',
      '#feb17d',
      '#f59563',
      '#f67c60',
      '#ff5c43',
      '#fad177',
      '#f6cf66',
      '#f9ca58',
      '#fbc52d',
      '#f46674',
      '#f24b5d',
      '#ec3f39',
      '#72b5e0',
      '#5da1e2',
      '#007fc2',
    ];

    tile.cell = cell;
    tile.value = 0;

    tile.set = function (value) {
      this.value = value;
      this.cell.style.backgroundColor = COLORS[this.value ? Math.log2(this.value) : 0];
      this.cell.textContent = this.value ? this.value : '';
      this.cell.classList = this.value ? `tile tile-${this.value}` : 'tile';
    };

    return tile;
  }
}
