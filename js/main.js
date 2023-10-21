// Stage 1: Player places their pieces
// Initialise empty board
// Player will hover mouse over the board and it will highlight the cells the boat will go in
// - for a size 5 boat 5 cells will be highlight
// Player can right click to rotate the boat
// Player clicks to place the boat on the board
// The boat is highlighted to show it is placed (along the bottom)
// The next boat will be highlighted
// Player repeats until all boats are placed
/**
 * Initialisation:
 * game variables:
 * - current turn
 * - winner
 * - game stage (setup or gameplay)
 * - ship types
 *   - used to create the tile class' ship status
 *
 * tile variables:
 * - board/cell status
 *   - null = unselected
 *   - 0 = guessed/missed
 *   - 1 = ship #1 placed
 *   - -1 = ship #1 placed and hit
 * - ship status
 *   - isSunk
 *   -
 *
 */
//// Board Data:
// Number to indicate which boat is placed (0=nothing in the cell)
// +/- to define if the cell has been selected by the opponent

// Initialise the computer board
// The 'AI' picks its positions for each boat:
// Pick a random orientation of the boat (horizontal/vertical)
// Pick a random cell
// - Validate if the boat can fit (has enough vertical/horizontal space)
//    - This will check for other boats already placed and the edges of the board
// Place the next boat until all boats are placed

// Stage 2: guessing
// - The boats on the player's board will be shown as dots, but hidden on the computer's board
// Randomise which player goes first
// When player picks (on the computer board), they click on the board the cell they want to pick
// - Only allow selecting on the computer board (hover/click on the player board will do nothing)
// - validate if the cell has been selected already
// - if it is a hit, highlight red
// - if it is a miss, highlight blue
// - if the boat is sunk, highlight grey

// Computer picks, highlights on the player board
// - Same highlighting rules as above

// After a boat is hit, check if that boat is sunk
// After a boat is sunk, check if the other player has any boats left.
// If yes, continue with the game
// If no, the current player has won

//// Computer cell selection:
// If the last cell placed was a miss, pick a random cell
// - validate the cell has not been selected already
// If the last cell placed was a hit and sink, pick a random cell
// - validate the cell has not been selected already
// If the last cell placed was a hit but not a sink:
// - Pick a cell next to the last placed cell
//   - If there is a row of cells already hit, pick the next cell in the row
//   - Need to handle cases where two boats are next to each other (inline or perpendicular)

/**
 * Board design:
 * Columns will be defined by the single digit value of the cell number
 * Rows will be defined by the 10s value of the cell number
 * Eg. cell 23 is column 3, row 2 (with 0 index format)
 * column = cell % 10
 * row = Math.floor(cell / 10)
 */

/** Extension:
 * Add option to play with 'Salvos' rules
 */

class Cell {
    constructor(cellElement) {
        this.cellElement = cellElement;
        this.value = null;
    }
    // prettier-ignore
    static renderLookup = {
        'null': 'white',
        '0': 'blue',
        '1': '#474747',
        '2': '#463838',
        '3': '#3c4638',
        '4': '#433846'
    }

    render() {
        if (this.value !== null) {
            this.cellElement.innerHTML = '&#x2022;';
        }
        this.cellElement.style.backgroundColor = Cell.renderLookup[this.value];
    }
}

class playerTile {
    constructor(playerTileElement) {
        // Define sections of the player game tile
        this.tileHeaderElement =
            playerTileElement.querySelector('.tile-header');
        this.tileBoardElement = playerTileElement.querySelector('.tile-board');
        this.tileShipsElement = playerTileElement.querySelector('.tile-ships');
        this.ships = [
            {
                id: 0,
                name: 'Carrier',
                size: 5,
                destroyed: false,
                placed: false,
            },
            {
                id: 1,
                name: 'Battleship',
                size: 4,
                destroyed: false,
                placed: false,
            },
            {
                id: 2,
                name: 'Destroyer',
                size: 3,
                destroyed: false,
                placed: false,
            },
            {
                id: 3,
                name: 'Submarine',
                size: 3,
                destroyed: false,
                placed: false,
            },
            { id: 4, name: 'Patrol', size: 2, destroyed: false, placed: false },
        ];

        // Define cells in the game board
        this.boardCellsElement = [
            ...this.tileBoardElement.querySelectorAll('div'),
        ];
        this.boardCells = this.boardCellsElement.map(
            (cellElement) => new Cell(cellElement)
        );

        // Define cells in the ships section
        this.shipCellsElement = [
            ...this.tileShipsElement.querySelectorAll('div'),
        ];
    }

    render() {
        // (after debugging done, dont render ship positions on computer board)
        // Add &#x2022; character to each div that has a boat in it
        this.boardCells.forEach((cell) => cell.render());
        // Add colour to each div based on the boat
    }
}

class BattleshipGame {
    constructor(gameElement) {
        this.playerTileElement = game.querySelector('#player');
        this.computerTileElement = game.querySelector('#computer');
        this.human = new playerTile(this.playerTileElement);
        this.computer = new playerTile(this.computerTileElement);

        this.addListeners();
    }

    addListeners() {
        // Listener for the button
        // Listener for the hover
        // Listener for the click
        this.playerTileElement.addEventListener('click', (event) => {
            const cellElementIndex = this.human.boardCellsElement.indexOf(
                event.target
            );
            const cell = this.human.boardCells[cellElementIndex];

            if (!cell || cell.value !== null || this.winner) {
                return;
            }

            // Get current ship
            const ship = getCurrentShip(human.ships);
            // Validate if ship can fit in cell
        });
        // Listener for the right click
    }

    play() {
        this.turn = 1; // change to randomised first player
        this.winner = null;
        this.gameStage = 0;

        this.computerInit();
        this.render();
    }

    computerInit() {
        // Add ships to game board
        // The 'AI' picks its positions for each boat:
        // Pick a random orientation of the boat (horizontal/vertical)
        // Pick a random cell
        // - Validate if the boat can fit (has enough vertical/horizontal space)
        //    - This will check for other boats already placed and the edges of the board
        // Place the next boat until all boats are placed

        const computerBoardCells = this.computer.boardCells;

        this.computer.ships.forEach((ship) => {
            // pick random orientation
            const orientation = Math.floor(Math.random() * 2); // 0 = horizontal, 1 = vertical
            let cellNum = Math.floor(Math.random() * 100);
            // get cell for boat placement
            while (true) {
                if (
                    this.validateCellForShip(
                        computerBoardCells,
                        cellNum,
                        ship.size,
                        orientation
                    )
                ) {
                    break;
                }
                if (cellNum > 96) {
                    cellNum = 0;
                } else {
                    cellNum += 3;
                }
            }

            // place boat
            this.placeShip(computerBoardCells, cellNum, ship, orientation);
        });
        this.tmpPrintValues(computerBoardCells);
        this.render();
    }

    tmpPrintValues(playerBoard) {
        playerBoard.forEach((cell, idx) => {
            if (cell.value !== null) {
                console.log(`cellNum: ${idx}, Value: ${cell.value}`);
            }
        });
    }

    placeShip(playerBoard, cellNum, ship, shipOrientation) {
        // Takes the playerBoard, cell selection, ship object and ship orientation as inputs
        // It assumes the ship is ok to be placed (validation has occurred already)
        for (let i = 0; i < ship.size; i++) {
            if (shipOrientation) {
                // Vertical
                // playerBoard[cellNum]
                playerBoard[cellNum + i * 10].value = ship.id;
            } else {
                // Horizontal
                playerBoard[cellNum + i].value = ship.id;
            }
        }
    }

    validateCellForShip(playerBoard, cellNum, shipLength, shipOrientation) {
        // Takes the playerBoard, cell selection, ship length and ship orientation as inputs
        // It will check if the selected cell is free, if not return false
        // It will validate if the ship can fit in the selected space
        // This will use the orientation and length of the ship to confirm it can fit on the board
        const cellColumn = cellNum % 10;
        const cellRow = Math.floor(cellNum / 10);
        // check if the cell is filled
        if (playerBoard[cellNum].value !== null) {
            return false;
        }

        if (shipOrientation) {
            // check for vertical fit (no ships in the way)
            // check for vertical obstruction (other ships in the way)
            for (let i = 1; i < shipLength; i++) {
                if (
                    cellRow + i > 9 ||
                    playerBoard[cellNum + i * 10].value !== null
                ) {
                    return false;
                }
            }
        } else {
            // check for horizontal fit (no ships in the way)
            // check for horizontal obstruction (other ships in the way)
            for (let i = 1; i < shipLength; i++) {
                if (
                    cellColumn + i > 9 ||
                    playerBoard[cellNum + i].value !== null
                ) {
                    return false;
                }
            }
        }
        return true;
    }

    render() {
        //if gamestage = 0, computer board is hidden

        this.human.render();
        this.computer.render();
    }
}

function initialise() {
    const gameElement = document.querySelector('#game');
    const game = new BattleshipGame(gameElement);

    // Guessing stage of game to begin
    game.play();
}

initialise();
