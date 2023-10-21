// Stage 1: Player places their pieces
// Initialise board
// Player will hover mouse over the board and it will highlight the cells the boat will go in
// - for a size 5 boat 5 cells will be highlight
// Player can right click to rotate the boat
// Player clicks to place the boat on the board
// The boat is highlighted to show it is placed (along the bottom)
// The next boat will be highlighted
// Player repeats until all boats are placed

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

/** Extension:
 * Add option to play with 'Salvos' rules
 */
