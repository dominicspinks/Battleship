class Cell {
    constructor(cellElement) {
        this.cellElement = cellElement;
        this.value = null;
    }

    // prettier-ignore
    static renderLookup = {
        'null': 'var(--colour-cell-background)',
        '0': 'var(--colour-miss)',
        '1': 'var(--colour-ship-1)',
        '2': 'var(--colour-ship-2)',
        '3': 'var(--colour-ship-3)',
        '4': 'var(--colour-ship-4)',
        '5': 'var(--colour-ship-5)',
        '-1': 'var(--colour-ship-hit)',
        '-2': 'var(--colour-ship-hit)',
        '-3': 'var(--colour-ship-hit)',
        '-4': 'var(--colour-ship-hit)',
        '-5': 'var(--colour-ship-hit)',
        '-99': 'var(--colour-cell-background)'
    }

    render(isComputer, gameStage, ships) {
        // Reset cell background colour
        this.cellElement.style.backgroundColor =
            'var(--colour-cell-background)';

        const a = ships.filter(
            (ship) => ship.id === Math.abs(this.value)
        ).destroyed;
        // Render cell background based on cell value
        if (!isComputer || (isComputer && this.value <= 0) || gameStage === 3) {
            const curShip = ships.filter(
                (ship) => ship.id === Math.abs(this.value)
            );
            if (curShip.length > 0 && curShip[0].destroyed) {
                this.cellElement.style.backgroundColor =
                    'var(--colour-ship-destroyed)';
            } else {
                this.cellElement.style.backgroundColor =
                    Cell.renderLookup[this.value];
            }
        }
    }

    renderHighlight(valid, gameStage) {
        if (valid || gameStage === 2) {
            this.cellElement.style.backgroundColor =
                'var(--colour-hover-valid)';
        } else {
            // Render cell to show a ship cannot be placed in this cell
            this.cellElement.style.backgroundColor =
                'var(--colour-hover-invalid)';
        }
    }
}

class playerTile {
    constructor(playerTileElement, isComputer) {
        // Define sections of the player game tile
        this.playerTileElement = playerTileElement;
        this.tileHeaderElement =
            playerTileElement.querySelector('.tile-header');
        this.tileBoardElement = playerTileElement.querySelector('.tile-board');
        this.tileShipsElement = playerTileElement.querySelector('.tile-ships');
        this.isComputer = isComputer;
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
        // Render main cells
        this.boardCells.forEach((cell) =>
            cell.render(this.isComputer, gameStage, this.ships)
        );

        // Hide if game setup in progress
        if (gameStage < 2 && this.isComputer) {
            this.playerTileElement.style.display = 'none';
        } else {
            this.playerTileElement.style.removeProperty('display');
        }

        // Render ship section
        switch (gameStage) {
            // In setup stages
            case 0:
            case 1:
                for (let i = 0; i < this.shipCellsElement.length; i++) {
                    // Add ship name
                    this.shipCellsElement[
                        i
                    ].innerHTML = `<p>${this.ships[i].name} - ${this.ships[i].size}</p>`;
                    // Reset border highlight
                    this.shipCellsElement[i].style.removeProperty('background');
                    if (this.ships[i].placed) {
                        this.shipCellsElement[i].style.background =
                            'var(--colour-ships-placed)';
                    } else {
                        this.shipCellsElement[i].style.background =
                            'var(--colour-ships-background)';
                    }
                }

                const currentShipIndex = this.ships.findIndex(
                    (ship) => !ship.placed
                );
                if (currentShipIndex !== -1) {
                    this.shipCellsElement[currentShipIndex].style.background =
                        'var(--colour-ships-placing)';
                }
                break;
            // In guessing stage
            case 2:
            case 3:
                for (let i = 0; i < this.shipCellsElement.length; i++) {
                    this.shipCellsElement[i].style.background =
                        'var(--colour-ships-background)';
                    this.shipCellsElement[
                        i
                    ].innerHTML = `<p>${this.ships[i].name} - ${this.ships[i].size}</p>`;
                    this.shipCellsElement[i].style.removeProperty('border');
                    if (this.ships[i].destroyed) {
                        this.shipCellsElement[i].style.background =
                            'var(--colour-ships-destroyed)';
                    } else {
                        this.shipCellsElement[i].style.background =
                            'var(--colour-ships-background)';
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
        this.messageElement = game.querySelector('.message');
        this.message2Element = game.querySelector('.message2');

        // Generate player tiles
        this.human = new playerTile(this.playerTileElement, false);
        this.computer = new playerTile(this.computerTileElement, true);

        // Time in ms for message update delay
        this.renderDelay = 1000;

        // Track timeouts so they can be cleared upon game reset
        this.timeoutIDs = [];

        // Initialise listeners
        this.addListeners();
    }

    addListeners() {
        // Listener for the Reset Button
        this.buttonResetElement.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

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
            event.stopImmediatePropagation();
            // This button will appear after all player ships have been placed
            // Clicking will begin stage 2 of the game
            this.gameStage = 2;
            this.render();

            // Cycle the displayed tiles based on the current player
            this.hideTiles();
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

            // If target is not the cells, call the main render again to clear any highlights
            if (!cells[cellNum] || this.winner) {
                this.render();
                return;
            }

            // Highlight the cells in the player board based on the current ship
            this.validateShipPreview(cells, cellNum);
        });

        // Listener for the click on player tile
        this.playerTileElement.addEventListener('click', (event) => {
            event.stopImmediatePropagation();
            event.preventDefault();
            // If the game is in stage 1, 2 or 3, the playerTileElement cannot be clicked
            if (this.gameStage !== 0) {
                return;
            }

            const cellNum = this.human.boardCellsElement.indexOf(event.target);
            const cell = this.human.boardCells[cellNum];

            // If it is not a cell, or the cell is not empty, do nothing
            if (!cell || cell.value !== null) {
                return;
            }
            // Eliminate cells that are impossible to fit a boat
            this.eliminateCells(playerCells, playerShips);
            // Get current ship
            const ship = this.getCurrentShip(this.human.ships);

            // Validate if ship can fit in cell, if not do nothing
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
            this.validateShipPreview(
                this.human.boardCells,
                this.human.boardCellsElement.indexOf(event.target)
            );
        });

        // Listener for the hover on computer tile
        this.computerTileElement.addEventListener('mouseover', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            // Do nothing during stages 0 and 1 or if it is the computer's turn
            if (this.gameStage !== 2 || this.turn === -1) {
                return;
            }

            const cell =
                this.computer.boardCells[
                    this.computer.boardCellsElement.indexOf(event.target)
                ];

            // If target is not the cells, call the main render again to clear any highlights
            this.render();
            if (!cell) {
                return;
            }

            // Render the highlighting on the computer board
            cell.renderHighlight(this.validateCellGuess(cell), this.gamestage);
        });

        // Listener for the click on computer tile
        this.computerTileElement.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            // Do nothing during stages 0, 1 and 3 or if it is the computer's turn
            if (this.gameStage !== 2 || this.turn === -1) {
                return;
            }

            const cells = this.computer.boardCells;
            const cell =
                cells[this.computer.boardCellsElement.indexOf(event.target)];

            // Check if cell can be clicked, if not do nothing
            if (!this.validateCellGuess(cell)) {
                return;
            }

            // Update selected cell
            const guessStatus = this.makeGuess(cell);

            // Validate if there are any ships left
            if (this.validateShips(cells, this.computer.ships)) {
                // Game is over
                this.gameStage = 3;
                this.winner = this.turn;
                this.render();
                return;
            }

            this.render();
            this.renderMessages(guessStatus);

            // Change player turn
            this.turn *= -1;

            // Render next player message
            this.timeoutIDs.push(
                setTimeout(() => {
                    this.renderMessages();
                    this.hideTiles();
                }, this.renderDelay)
            );

            // Call next player
            this.timeoutIDs.push(
                setTimeout(() => {
                    this.computerGuess();
                }, this.renderDelay * 1.5)
            );
        });
    }

    hideTiles() {
        // This is to handle which tile is displayed on screen for small displays
        if (this.turn === 1) {
            // Players turn , hide player tile
            this.human.playerTileElement.classList.add('hide-tile');
            this.computer.playerTileElement.classList.remove('hide-tile');
        } else {
            // Computer's turn, hide computer tile
            this.human.playerTileElement.classList.remove('hide-tile');
            this.computer.playerTileElement.classList.add('hide-tile');
        }
    }

    getComputerGuess(playerCells, playerShips) {
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
            // If hitCells > 1, the computer knows what the orientation is
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

            if (availableCells.length > 0) {
                return availableCells[
                    Math.floor(Math.random() * availableCells.length)
                ];
            }
        }

        // Eliminate cells that are impossible to fit a boat
        this.eliminateCells(playerCells, playerShips);

        // No ships are partially hit, so make a random guess from remaining cells
        const remainingCells = playerCells.filter(
            (cell) => cell.value === null || cell.value > 0
        );
        return remainingCells[
            Math.floor(Math.random() * remainingCells.length)
        ];
    }

    computerGuess() {
        // Computer to make a selection on the player board
        const cells = this.human.boardCells;
        const ships = this.human.ships;

        // Update selected cell
        const guessStatus = this.makeGuess(this.getComputerGuess(cells, ships));

        // Validate if there are any ships left
        if (this.validateShips(cells, this.human.ships)) {
            // Game is over
            this.gameStage = 3;
            this.winner = this.turn;
            this.render();
            return;
        }

        this.render();
        this.renderMessages(guessStatus);

        // Change player turn
        this.turn *= -1;

        // Render next player message
        this.timeoutIDs.push(
            setTimeout(() => {
                this.renderMessages();
                this.hideTiles();
            }, this.renderDelay * 1.5)
        );
    }

    eliminateCells(playerCells, playerShips) {
        // this will automatically mark any cells that cannot fit any of the remaining ships
        // eg, if a cell is surround on all sides, it cannot fit a boat and the computer should not pick from it

        // Get minimum length of ship remaining
        let minShipLength = playerShips[0].size;
        playerShips.forEach((ship) => {
            if (ship.size < minShipLength && !ship.destroyed) {
                minShipLength = ship.size;
            }
        });

        // Test each cell that hasn't been guessed or eliminated
        for (let cellIndex = 0; cellIndex < playerCells.length; cellIndex++) {
            // Skip cell if it already has a guess or elimination applied
            if (
                playerCells[cellIndex].value !== null &&
                playerCells[cellIndex].value <= 0
            ) {
                continue;
            }

            // Check left
            let spacesLeft = 0;
            for (let i = 1; i <= minShipLength; i++) {
                if (
                    cellIndex - i >= 0 &&
                    (cellIndex - i) % 10 < cellIndex % 10 &&
                    (playerCells[cellIndex - i].value === null ||
                        playerCells[cellIndex - i].value > 0)
                ) {
                    spacesLeft++;
                } else {
                    break;
                }
            }
            // If there are enough spaces to fit a ship, continue to the next cell
            if (1 + spacesLeft >= minShipLength) {
                continue;
            }

            // Check right
            let spacesRight = 0;
            for (let i = 1; i <= minShipLength; i++) {
                if (
                    cellIndex + i < 100 &&
                    (cellIndex + i) % 10 > cellIndex % 10 &&
                    (playerCells[cellIndex + i].value === null ||
                        playerCells[cellIndex + i].value > 0)
                ) {
                    spacesRight++;
                } else {
                    break;
                }
            }
            // If there are enough spaces to fit a ship, continue to the next cell
            if (1 + spacesLeft + spacesRight >= minShipLength) {
                continue;
            }

            // Check up
            let spacesUp = 0;
            for (let i = 1; i <= minShipLength; i++) {
                if (
                    cellIndex - i * 10 >= 0 &&
                    (playerCells[cellIndex - i * 10].value === null ||
                        playerCells[cellIndex - i * 10].value > 0)
                ) {
                    spacesUp++;
                } else {
                    break;
                }
            }
            // If there are enough spaces to fit a ship, continue to the next cell
            if (1 + spacesUp >= minShipLength) {
                continue;
            }

            // Check down
            let spacesDown = 0;
            for (let i = 1; i <= minShipLength; i++) {
                if (
                    cellIndex + i * 10 < 100 &&
                    (playerCells[cellIndex + i * 10].value === null ||
                        playerCells[cellIndex + i * 10].value > 0)
                ) {
                    spacesDown++;
                } else {
                    break;
                }
            }
            // If there are enough spaces to fit a ship, continue to the next cell
            if (1 + spacesUp + spacesDown >= minShipLength) {
                continue;
            }

            // All validations failed, update playerCells
            playerCells[cellIndex].value = -99;
        }
    }

    validateShips(playerCells, playerShips) {
        // Check the ships for the given player to see which are sunk
        playerShips.forEach((ship) => {
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
    }

    validateCellGuess(cell) {
        // Determines if the input cell is valid to be guessed
        if (typeof cell !== 'undefined') {
            return cell.value === null || cell.value > 0;
        }
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
        // Get the first ship from the array that has not been placed
        return ships.find((ship) => !ship.placed);
    }

    play() {
        this.turn = 1; // change to randomised first player
        this.winner = null;
        this.gameStage = 0; // 0 = starting, 1 = players ships placed, 2 = guessing stage, 3 = end game

        this.computerInit();
        this.render();
    }

    computerInit() {
        // Add ships to the computers game board

        const computerBoardCells = this.computer.boardCells;

        this.computer.ships.forEach((ship) => {
            // Pick random orientation
            ship.orientation = Math.floor(Math.random() * 2) === 0 ? 'h' : 'v'; // 0 = horizontal, 1 = vertical
            let cellNum = Math.floor(Math.random() * 100);
            // Get cell for boat placement
            while (true) {
                if (
                    this.validateCellForShip(computerBoardCells, cellNum, ship)
                ) {
                    break;
                }
                // Skip 3 rows down and 3 columns across to limit placing ships side by side
                cellNum += 33;
                if (cellNum > 99) {
                    cellNum -= 100;
                }
            }

            // Place ship
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

        // Check if the cell is filled
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

        // Render the messages:
        this.renderMessages();
    }

    renderMessages(hitState) {
        // Update the message on screen
        switch (this.gameStage) {
            case 0:
                // Placing stage
                this.messageElement.innerHTML =
                    'Place your ships on the board. <br>Right click to rotate';
                break;
            case 1:
                // End of placing stage
                this.messageElement.innerHTML =
                    'Press start to begin the game<br>';
                break;
            case 2:
                // Guessing stage
                if (typeof hitState === 'undefined') {
                    if (this.turn === 1) {
                        // Player's turn
                        this.messageElement.innerHTML = 'Your turn';
                        break;
                    } else {
                        // Computer's turn
                        this.messageElement.innerHTML = "Computer's turn";
                        break;
                    }
                }
                if (this.turn === 1) {
                    // Player's turn
                    if (hitState) {
                        this.messageElement.innerHTML =
                            'Your turn<br><span>HIT!</span>';
                        break;
                    } else {
                        this.messageElement.innerHTML =
                            'Your turn<br><span>MISS!</span>';
                        break;
                    }
                }
                // Computer's turn
                this.messageElement.innerHTML = hitState
                    ? "Computer's turn<br><span>HIT!</span>"
                    : "Computer's turn<br><span>MISS!</span>";
                break;
            case 3:
                // The game is over, display the winner
                this.messageElement.innerHTML =
                    this.winner === 1
                        ? '<span>YOU WIN!</span>'
                        : '<span>YOU LOSE!</span>';
                break;
        }
    }

    renderStartButton() {
        // Display after player places all ships
        if (this.gameStage === 1) {
            this.buttonStartElement.style.removeProperty('display');
        } else {
            this.buttonStartElement.style.display = 'none';
        }
    }

    reinitialise() {
        // Stop any existing timeouts if in progress
        for (let i = this.timeoutIDs.length; i > 0; i--) {
            clearTimeout(this.timeoutIDs.pop());
        }

        // Prepare the environment for a new game
        this.human = new playerTile(this.playerTileElement, false);
        this.computer = new playerTile(this.computerTileElement, true);

        this.computer.playerTileElement.classList.remove('hide-tile');
        this.human.playerTileElement.classList.remove('hide-tile');

        this.play();
    }
}

function initialise() {
    const gameElement = document.querySelector('#game');
    const game = new BattleshipGame(gameElement);

    // Guessing stage of game to begin
    game.play();
}

initialise();
