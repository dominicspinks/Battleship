/**
 * To Do:
 * - Reset button reinitialisation process
 * - CSS Styles
 * - Add ship images to the ship sections
 * - Stage 2 gameplay
 */

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
        '4': '#433846',
        '5': '#433846',
        '-1': 'grey',
        '-2': 'grey',
        '-3': 'grey',
        '-4': 'grey',
        '-5': 'grey',
    }

    render() {
        if (this.value !== null) {
            // this.cellElement.innerHTML = '&#x2022;';
        }
        this.cellElement.style.backgroundColor = Cell.renderLookup[this.value];
    }

    renderHighlight(valid) {
        if (valid) {
            // Render cell to show a ship can go in this cell
            this.cellElement.style.backgroundColor = '#777';
        } else {
            // Render cell to show a ship cannot be placed in this cell
            this.cellElement.style.backgroundColor = 'red';
        }
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
                id: 1,
                name: 'Carrier',
                size: 5,
                destroyed: false,
                placed: false,
                orientation: 'h',
            },
            {
                id: 2,
                name: 'Battleship',
                size: 4,
                destroyed: false,
                placed: false,
                orientation: 'h',
            },
            {
                id: 3,
                name: 'Destroyer',
                size: 3,
                destroyed: false,
                placed: false,
                orientation: 'h',
            },
            {
                id: 4,
                name: 'Submarine',
                size: 3,
                destroyed: false,
                placed: false,
                orientation: 'h',
            },
            {
                id: 5,
                name: 'Patrol',
                size: 2,
                destroyed: false,
                placed: false,
                orientation: 'h',
            },
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

    render(gameStage) {
        // (after debugging done, dont render ship positions on computer board)
        // Render main cells
        this.boardCells.forEach((cell) => cell.render());

        // Render ship section
        switch (gameStage) {
            case 0:
            case 1:
                for (let i = 0; i < this.shipCellsElement.length; i++) {
                    this.shipCellsElement[
                        i
                    ].innerHTML = `<h4>${this.ships[i].name}</h4>`;
                    this.shipCellsElement[i].style.removeProperty('border');
                    if (this.ships[i].placed) {
                        this.shipCellsElement[i].style.background = '#EEE';
                    }
                }

                const currentShipIndex = this.ships.findIndex(
                    (ship) => !ship.placed
                );
                if (currentShipIndex !== -1) {
                    this.shipCellsElement[currentShipIndex].style.border =
                        '1px solid red';
                }
                break;
            case 2:
                for (let i = 0; i < this.shipCellsElement.length; i++) {
                    this.shipCellsElement[
                        i
                    ].innerHTML = `<h4>${this.ships[i].name}</h4>`;
                    this.shipCellsElement[i].style.removeProperty('border');
                    if (this.ships[i].destroyed) {
                        this.shipCellsElement[i].style.background = 'grey';
                    } else {
                        this.shipCellsElement[i].style.background = 'white';
                    }
                }
                break;
        }
    }
}

class BattleshipGame {
    constructor(gameElement) {
        // Cache HTML elements
        this.playerTileElement = game.querySelector('#player');
        this.computerTileElement = game.querySelector('#computer');
        this.buttonResetElement = game.querySelector('#button-reset');
        this.buttonStartElement = game.querySelector('#button-start');

        // Generate player tiles
        this.human = new playerTile(this.playerTileElement);
        this.computer = new playerTile(this.computerTileElement);

        // Initialise listeners
        this.addListeners();
    }

    addListeners() {
        // Listener for the Reset Button
        this.buttonResetElement.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            // This is added to stop cases of double actions on the button

            // This button will reinitialise the board
            if (
                confirm('This will start a new game. Do you want to continue?')
            ) {
                this.reinitialise();
            } else {
                return;
            }
        });

        // Listener for the Start Button
        this.buttonStartElement.addEventListener('click', (event) => {
            event.preventDefault();
            // This button will appear after all player ships have been placed
            // Clicking will begin stage 2 of the game
            this.gameStage = 2;
            this.render();
        });

        // Listener for the hover on player tile
        this.playerTileElement.addEventListener('mouseover', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            // If the game is in stage 2, hovering over playerTileElement does nothing
            if (this.gameStage !== 0) {
                return;
            }

            const cellNum = this.human.boardCellsElement.indexOf(event.target);
            const cells = this.human.boardCells;
            const cell = cells[cellNum];

            // If target is not the cells, call the main render again to clear any highlights
            if (!cell || cell.value !== null || this.winner) {
                this.render();
                return;
            }

            this.validateShipPreview(cells, cellNum);
        });

        // Listener for the click on player tile
        this.playerTileElement.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            // If the game is in stage 1 or 2, the playerTileElement cannot be clicked
            if (this.gameStage !== 0) {
                return;
            }

            const cellNum = this.human.boardCellsElement.indexOf(event.target);
            const cell = this.human.boardCells[cellNum];

            if (!cell || cell.value !== null || this.winner) {
                return;
            }

            // Get current ship
            const ship = this.getCurrentShip(this.human.ships);

            // Validate if ship can fit in cell
            if (
                !this.validateCellForShip(this.human.boardCells, cellNum, ship)
            ) {
                return;
            }
            // Place ship
            this.placeShip(this.human.boardCells, cellNum, ship);

            // Check if it was the last ship to be placed
            if (
                this.human.ships.indexOf(ship) ===
                this.human.ships.length - 1
            ) {
                this.gameStage = 1;
            }
            this.render();
        });

        // Listener for the right click on player tile
        this.playerTileElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            // If the game is in stage 2, the right click does nothing
            if (this.gameStage === 2) {
                return;
            }

            // Switch the orientation of the current ship
            const ship = this.getCurrentShip(this.human.ships);
            ship.orientation = ship.orientation === 'h' ? 'v' : 'h';

            // Call the hover/highlist process to handle right clicking while hovering
            const cells = this.human.boardCells;
            const cellNum = this.human.boardCellsElement.indexOf(event.target);

            this.validateShipPreview(cells, cellNum);
        });

        // Listener for the hover on computer tile
        this.computerTileElement.addEventListener('mouseover', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            // Do nothing during stages 0 and 1 or if it is the computer's turn
            if (
                this.gameStage !== 2 ||
                this.turn === -1 ||
                this.winner !== null
            ) {
                return;
            }

            const cellNum = this.computer.boardCellsElement.indexOf(
                event.target
            );
            const cells = this.computer.boardCells;
            const cell = cells[cellNum];

            // If target is not the cells, call the main render again to clear any highlights
            this.render();
            if (!cell || cell.value !== null || this.winner) {
                return;
            }
            const valid = this.validateCellGuess(cell);
            console.log(valid);

            cell.renderHighlight(valid);
        });

        // Listener for the click on computer tile
        this.computerTileElement.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            // Do nothing during stages 0 and 1 or if it is the computer's turn
            if (this.gameStage !== 2 || this.turn === -1) {
                return;
            }

            const cellNum = this.computer.boardCellsElement.indexOf(
                event.target
            );
            const cells = this.computer.boardCells;
            const cell = cells[cellNum];

            // Check if cell can be clicked, if not do nothing
            if (!this.validateCellGuess(cell)) {
                return;
            }

            // Update selected cell
            this.makeGuess(cell);

            // Validate if there are any ships left
            if (this.validateShips(cells, this.computer.ships)) {
                // Game is over
                this.winner = this.turn;
                this.render();
                return;
            }

            // Change player turn
            this.turn *= -1;
            this.render();

            // Call next playercellNum
            this.computerGuess();
        });
    }

    tmpPrintCellValues(playerCells) {
        playerCells.forEach((cell) => {
            if (cell.value !== null) {
                console.log(cell.value);
            }
        });
    }

    getComputerGuess(playerCells, playerShips) {
        // for each ship id of non destroyed ships, count the number of times its negative appears in the playerCells
        // If all are 0, make a random guess
        // If one is less than the size of the boat, determine the next guess based on that cell
        // - if the count is one, make a random selection either up/down/left/right from that cell
        //   - This will take into account the other positions on the board (only null cells and checking for edges of the board)
        // - if the count is 2 or more, use the existing values to determine the ship's orientation (or should I just use the orientation value?)
        // - Make the guess on the next horizontal/vertical cell based on the orientation

        // Ignore ships that are already destroyed
        for (let ship of playerShips.filter((ship) => !ship.destroyed)) {
            // Find ships that have been partially destroyed
            const hitCells = playerCells.filter(
                (cell) => cell.value === -ship.id
            );

            // Handle case where one cell on the ship has been hit
            // Check the cells around the cell for obstructions (edges or other ships)
            const startCellIndex = playerCells.findIndex(
                (cell) => cell === hitCells[0]
            );
            const endCellIndex = playerCells.findIndex(
                (cell) => cell === hitCells[hitCells.length - 1]
            );
            // Create an array of the cells the computer can pick from
            const availableCells = [];
            // If hitCells > 1, the computer know what the orientation is
            // eg if it is vertical, it only guesses from above or below
            // Check in the row above
            if (
                (hitCells.length === 1 ||
                    (hitCells.length > 1 && ship.orientation === 'v')) &&
                startCellIndex - 10 > 0 &&
                (playerCells[startCellIndex - 10].value === null ||
                    playerCells[startCellIndex - 10].value > 0)
            ) {
                availableCells.push(playerCells[startCellIndex - 10]);
            }
            // Check in the row below
            if (
                (hitCells.length === 1 ||
                    (hitCells.length > 1 && ship.orientation === 'v')) &&
                endCellIndex + 10 < 100 &&
                (playerCells[endCellIndex + 10].value === null ||
                    playerCells[endCellIndex + 10].value > 0)
            ) {
                availableCells.push(playerCells[endCellIndex + 10]);
            }
            // Check in the column to the left
            if (
                (hitCells.length === 1 ||
                    (hitCells.length > 1 && ship.orientation === 'h')) &&
                startCellIndex - 1 >= 0 &&
                (startCellIndex - 1) % 10 < 9 &&
                (playerCells[startCellIndex - 1].value === null ||
                    playerCells[startCellIndex - 1].value > 0)
            ) {
                availableCells.push(playerCells[startCellIndex - 1]);
            }
            // Check in the column to the right
            if (
                (hitCells.length === 1 ||
                    (hitCells.length > 1 && ship.orientation === 'h')) &&
                endCellIndex + 1 < 100 &&
                (endCellIndex + 1) % 10 > 0 &&
                (playerCells[endCellIndex + 1].value === null ||
                    playerCells[endCellIndex + 1].value > 0)
            ) {
                availableCells.push(playerCells[endCellIndex + 1]);
            }
            console.log(availableCells);
            if (availableCells.length > 0) {
                return availableCells[
                    Math.floor(Math.random() * availableCells.length)
                ];
            }
        }
        // Eliminate cells that are impossible to fit a boat
        this.eliminateCells(playerCells, playerShips);

        // No ships are partially hit, make a random guess from remaining cells
        const remainingCells = playerCells.filter(
            (cell) => cell.value === null || cell.value > 0
        );
        return remainingCells[
            Math.floor(Math.random() * remainingCells.length)
        ];
    }

    computerGuess() {
        const cells = this.human.boardCells;
        const ships = this.human.ships;

        const cell = this.getComputerGuess(cells, ships);

        // Update selected cell
        this.makeGuess(cell);

        // Validate if there are any ships left
        if (this.validateShips(cells, ships)) {
            // Game is over
            this.winner = this.turn;
            this.render();
            return;
        }

        // Change player turn
        this.turn *= -1;
        this.render();
    }

    eliminateCells(playerCells, playerShips) {
        // this will automatically mark any cells that cannot fit any of the remaining ships
        // eg, if a cell is surround on all sides, it cannot fit a boat and the computer should not pick from it
    }
    validateShips(playerCells, playerShips) {
        // Check the ships for the given player to see which are sunk
        playerShips.forEach((ship) => {
            // this.tmpPrintCellValues(playerCells);
            if (
                playerCells.findIndex((cell) => cell.value === +ship.id) === -1
            ) {
                // Ship is sunk
                ship.destroyed = true;
            }
        });

        // Check if all ships are destroyed
        if (playerShips.findIndex((ship) => ship.destroyed === false) === -1) {
            // No ships are left
            return true;
        } else {
            // Ships are left
            return false;
        }
    }

    makeGuess(cellGuess) {
        // Update the cell value and return true if it was a hit
        if (cellGuess.value === null) {
            // Set the cell as a miss
            cellGuess.value = 0;
            return false;
        } else if (cellGuess.value > 0) {
            // Set the cell as a hit
            cellGuess.value *= -1;
            return true;
        }
        return false;
    }

    validateCellGuess(cell) {
        // Determines if the input cell is valid to be guessed
        return cell.value === null || cell.value > 0;
    }

    validateShipPreview(cells, cellNum) {
        // If the target is the player cells, render the cells based on the current ship
        // Get current ship
        const ship = this.getCurrentShip(this.human.ships);

        // Check if the ship will fit
        const valid = this.validateCellForShip(
            this.human.boardCells,
            cellNum,
            ship
        );

        // Render ship on relevant cells
        this.renderShipPreview(cells, cellNum, ship, valid);
    }

    renderShipPreview(boardCells, startingCell, ship, valid) {
        // Render the full board (to remove any previous highlights)
        this.human.render(this.gamestage);

        const startingCol = startingCell % 10;
        const startingRow = Math.floor(startingCell / 10);

        // Render each cell that will be covered by the ship
        for (let i = 0; i < ship.size; i++) {
            if (startingRow + i < 10 && ship.orientation === 'v') {
                boardCells[startingCell + i * 10].renderHighlight(valid);
            } else if (startingCol + i < 10 && ship.orientation === 'h') {
                boardCells[startingCell + i].renderHighlight(valid);
            }
        }
    }

    getCurrentShip(ships) {
        // Gets the first ship from the array that has not been placed
        // (where ship.placed === false)
        // Returns the ship object
        return ships.find((ship) => !ship.placed);
    }

    play() {
        this.turn = 1; // change to randomised first player
        this.winner = null;
        this.gameStage = 0; // 0 = starting, 1 = players ships placed, 2 = guessing stage

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
            ship.orientation = Math.floor(Math.random() * 2) === 0 ? 'h' : 'v'; // 0 = horizontal, 1 = vertical
            let cellNum = Math.floor(Math.random() * 100);
            // get cell for boat placement
            while (true) {
                if (
                    this.validateCellForShip(computerBoardCells, cellNum, ship)
                ) {
                    break;
                }
                cellNum += 23;
                if (cellNum > 99) {
                    cellNum -= 100;
                }
            }

            // place boat
            this.placeShip(computerBoardCells, cellNum, ship);
        });

        this.render();
    }

    placeShip(playerBoard, cellNum, ship) {
        // Takes the playerBoard, cell selection, ship object and ship orientation as inputs
        // It assumes the ship is ok to be placed (validation has occurred already)
        for (let i = 0; i < ship.size; i++) {
            if (ship.orientation === 'v') {
                // Vertical
                // playerBoard[cellNum]
                playerBoard[cellNum + i * 10].value = ship.id;
            } else {
                // Horizontal
                playerBoard[cellNum + i].value = ship.id;
            }
        }
        ship.placed = true;
    }

    validateCellForShip(playerBoard, cellNum, ship) {
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

        if (ship.orientation === 'v') {
            // check for vertical fit (no ships in the way)
            // check for vertical obstruction (other ships in the way)
            for (let i = 1; i < ship.size; i++) {
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
            for (let i = 1; i < ship.size; i++) {
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
        // Render the player's board
        this.human.render(this.gameStage);

        // Render the computer's board
        this.computer.render(this.gameStage);

        // Control when the start button is visible
        this.renderStartButton();

        // Control when computer tile is visible
        // this.renderComputerTile();
    }

    renderStartButton() {
        // Display after player places all ships
        if (this.gameStage === 1) {
            this.buttonStartElement.style.removeProperty('display');
        } else {
            this.buttonStartElement.style.display = 'none';
        }
    }

    renderComputerTile() {
        // Hide if game setup in progress
        if (this.gameStage === 2) {
            this.computerTileElement.style.removeProperty('display');
        } else {
            this.computerTileElement.style.display = 'none';
        }
    }

    reinitialise() {}
}

function initialise() {
    const gameElement = document.querySelector('#game');
    const game = new BattleshipGame(gameElement);

    // Guessing stage of game to begin
    game.play();
}

initialise();
