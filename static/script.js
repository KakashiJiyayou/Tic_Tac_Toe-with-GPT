// Initial board state
let board = [
  [".", ".", "."],
  [".", ".", "."],
  [".", ".", "."],
];

// Select all cells and the current player indicator
const cells = document.querySelectorAll(".cell");
const currentPlayerDisplay = document.getElementById("player");
let currentPlayer = "X"; // Start with Player X

// Turn control: true means Player 1's turn, false means Player 2's turn
let isPlayer1Turn = true;

// Beep sound effect
const beepSound = new Audio(
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="
);

// Winner container
const winnerContainer = document.createElement("div");
winnerContainer.classList.add("winner-container");
document.body.appendChild(winnerContainer);

// Reset message
const resetMessage = document.createElement("div");
resetMessage.classList.add("reset-message");
resetMessage.textContent = "Resetting Board...";
document.body.appendChild(resetMessage);

// Function to log the current board state
function logBoardState() {
  console.log(board); // Logs the current board state to the console
}

// Function to check for a winner
function checkWinner() {
  const winningCombinations = [
    [
      [0, 0],
      [0, 1],
      [0, 2],
    ], // Row 1
    [
      [1, 0],
      [1, 1],
      [1, 2],
    ], // Row 2
    [
      [2, 0],
      [2, 1],
      [2, 2],
    ], // Row 3
    [
      [0, 0],
      [1, 0],
      [2, 0],
    ], // Column 1
    [
      [0, 1],
      [1, 1],
      [2, 1],
    ], // Column 2
    [
      [0, 2],
      [1, 2],
      [2, 2],
    ], // Column 3
    [
      [0, 0],
      [1, 1],
      [2, 2],
    ], // Diagonal 1
    [
      [0, 2],
      [1, 1],
      [2, 0],
    ], // Diagonal 2
  ];

  for (const combo of winningCombinations) {
    const [a, b, c] = combo;
    if (
      board[a[0]][a[1]] !== "." &&
      board[a[0]][a[1]] === board[b[0]][b[1]] &&
      board[a[0]][a[1]] === board[c[0]][c[1]]
    ) {
      return board[a[0]][a[1]]; // Return the winner ('X' or 'O')
    }
  }

  return null; // No winner yet
}

// Function to check for a tie
function checkTie() {
  return board.every((row) => row.every((cell) => cell !== "."));
}

// Function to show the winner with animations
function show_winner(winner) {
  // Clear the winner container
  winnerContainer.innerHTML = "";

  // Map the winner symbol ('X' or 'O') to "Player 1" or "Player 2"
  const playerMap = { X: "Player 1", O: "GPT" };
  const winnerName = playerMap[winner];

  // Create winner text
  const winnerText = document.createElement("div");
  winnerText.classList.add("winner-text");
  winnerText.textContent = `${winnerName} Wins! 🎉`;
  winnerContainer.appendChild(winnerText);

  // Add balloons
  for (let i = 0; i < 20; i++) {
    const balloon = document.createElement("div");
    balloon.classList.add("balloon");
    balloon.style.left = `${Math.random() * 100}vw`;
    balloon.style.animationDuration = `${Math.random() * 3 + 2}s`;
    balloon.style.background = `linear-gradient(135deg, ${
      winner === "X" ? "#ff6f61" : "#6bff7f"
    }, ${winner === "X" ? "#ffaa42" : "#7affa5"})`;
    winnerContainer.appendChild(balloon);
  }

  // Show the winner container
  winnerContainer.classList.add("show");

  // Trigger reset after 5 seconds
  setTimeout(() => resetBoard(), 5000);
}

// Function to handle a tie
function show_tie() {
  resetMessage.textContent = "Game Tied!";
  resetMessage.classList.add("show");

  // Trigger reset after 3 seconds
  setTimeout(() => resetBoard(), 3000);
}

// Function to reset the board with animation
function resetBoard() {
  // Hide winner container and reset message
  winnerContainer.classList.remove("show");
  resetMessage.classList.remove("show");

  // Spin the board
  const boardElement = document.querySelector(".board");
  boardElement.classList.add("spin");

  // Reset the board state after the animation ends
  setTimeout(() => {
    boardElement.classList.remove("spin");
    board = [
      [".", ".", "."],
      [".", ".", "."],
      [".", ".", "."],
    ];
    currentPlayer = "X";
    currentPlayerDisplay.textContent = currentPlayer;

    // Clear all cells
    cells.forEach((cell) => {
      cell.textContent = "";
      cell.classList.remove("X", "O");

      //NOTE - Make Player1 turn true
      isPlayer1Turn = true;
    });
  }, 2000); // Match the duration of the spin animation
}

// Function to check game status
function check_game_status() {
  // Check for a winner
  const winner = checkWinner();
  if (winner) {
    show_winner(winner); // Show the winner with animations
    return; // Stop further moves
  }

  // Check for a tie
  if (checkTie()) {
    show_tie(); // Show tie message
    return; // Stop further moves
  }
}

// Add click event listeners to each cell
cells.forEach((cell, index) => {
  cell.addEventListener("click", () => {
    // If it's not Player 1's turn, do nothing
    if (!isPlayer1Turn) return;

    //NOTE - isPlayer1Turn  Player next click will not work if, server send reply
    isPlayer1Turn = false;

    const row = Math.floor(index / 3); // Calculate row index
    const col = index % 3; // Calculate column index

    // If the cell is already filled, do nothing
    if (board[row][col] !== ".") return;

    // Play beep sound
    beepSound.play();

    // Update the board state
    board[row][col] = currentPlayer;

    // Set the cell content to the current player's symbol
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer === "X" ? "X" : "O");

    // Add shake animation
    cell.classList.add("shake");
    setTimeout(() => cell.classList.remove("shake"), 200); // Remove shake after animation ends

    // Log the current board state
    logBoardState();

    // Function to check tie and win
    check_game_status();

    // Switch to the next player
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    displayPlayer = currentPlayer === "X" ? "User" : "GPT";
    currentPlayerDisplay.textContent = displayPlayer;

    //NOTE - Send board to backend
    sendBoardToBackend();
  });
});

//NOTE - Update board from the backend
// Function to update the board based on backend data
function updateBoardFromBackend(newBoard) {
  // Update the global board state
  board = newBoard;

  // Clear all cells
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("X", "O");
  });

  // Update the cells based on the new board state
  newBoard.forEach((row, rowIndex) => {
    row.forEach((cellValue, colIndex) => {
      const index = rowIndex * 3 + colIndex; // Calculate the flat index
      const cell = cells[index];

      if (cellValue === "X") {
        cell.textContent = "X";
        cell.classList.add("X");
      } else if (cellValue === "O") {
        cell.textContent = "O";
        cell.classList.add("O");
      }
    });
  });

  // Switch to the next player
  currentPlayer = "X";
  displayPlayer = "User";
  currentPlayerDisplay.textContent = displayPlayer;

  // Log the updated board state for debugging
  logBoardState();

  //NOTE - Allow Player 1 again
  isPlayer1Turn = true;
}

// Function to show the "Waiting for response..." message
function show_waiting() {
  const waitingMessage = document.getElementById("waiting-message");
  waitingMessage.classList.add("show");
}

// Function to hide the "Waiting for response..." message
function hide_waiting() {
  const waitingMessage = document.getElementById("waiting-message");
  waitingMessage.classList.remove("show");
}

/* SECTION Send Board Array
// Function to send the board to the Flask backend */
function sendBoardToBackend() {
  show_waiting();
  fetch("/process-board", {
    // Endpoint on the Flask backend
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Specify JSON data
    },
    body: JSON.stringify({ board: board }), // Convert the board to JSON
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); // Parse the JSON response
    })
    .then((data) => {
      console.log("Full response from backend:", data); // Log the full response
      console.log("Type of data.board:", typeof data.board); // Check the type of data.board
      console.log("Is data.board an array?", Array.isArray(data.board)); // Verify if it's an array
      console.log("Check board value with the previous value ", data.board);

      updateBoardFromBackend(data.board);
      hide_waiting();
      check_game_status();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
//!SECTION
