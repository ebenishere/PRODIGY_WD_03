const boardElement = document.getElementById("board");
const cells = Array.from(document.querySelectorAll(".cell"));
const statusText = document.getElementById("statusText");
const modeText = document.getElementById("modeText");
const xScoreElement = document.getElementById("xScore");
const oScoreElement = document.getElementById("oScore");
const drawScoreElement = document.getElementById("drawScore");
const newRoundBtn = document.getElementById("newRoundBtn");
const changeModeBtn = document.getElementById("changeModeBtn");
const modeModal = document.getElementById("modeModal");
const friendModeBtn = document.getElementById("friendModeBtn");
const aiModeBtn = document.getElementById("aiModeBtn");
const winnerModal = document.getElementById("winnerModal");
const winnerMessage = document.getElementById("winnerMessage");
const winnerOkBtn = document.getElementById("winnerOkBtn");

const WIN_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const HUMAN_PLAYER = "X";
const AI_PLAYER = "O";

let gameMode = null;
let boardState = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;

const scores = {
  X: 0,
  O: 0,
  draw: 0,
};

function updateStatus(message) {
  statusText.textContent = message;
}

function updateModeText() {
  if (gameMode === "friend") {
    modeText.textContent = "Mode: Player VS Player";
  } else if (gameMode === "ai") {
    modeText.textContent = "Mode: Player VS AI";
  } else {
    modeText.textContent = "Mode: Not selected";
  }
}

function showWinnerModal(player) {
  winnerMessage.textContent = `Player ${player} won`;
  winnerModal.classList.add("show");
}

function hideWinnerModal() {
  winnerModal.classList.remove("show");
}

function renderBoard() {
  boardState.forEach((value, index) => {
    const cell = cells[index];
    cell.textContent = value;
    cell.classList.remove("x-mark", "o-mark");

    if (value === "X") {
      cell.classList.add("x-mark");
    } else if (value === "O") {
      cell.classList.add("o-mark");
    }

    cell.disabled = gameOver || value !== "" || !gameMode;
  });
}

function updateScores() {
  xScoreElement.textContent = String(scores.X);
  oScoreElement.textContent = String(scores.O);
  drawScoreElement.textContent = String(scores.draw);
}

function evaluateWinner(state) {
  for (const combo of WIN_COMBINATIONS) {
    const [a, b, c] = combo;
    if (state[a] && state[a] === state[b] && state[b] === state[c]) {
      return state[a];
    }
  }

  if (!state.includes("")) {
    return "draw";
  }

  return null;
}

function setGameResult(result) {
  gameOver = true;
  newRoundBtn.disabled = false;

  if (result === "draw") {
    scores.draw += 1;
    updateStatus("Round ended in a draw");
  } else {
    scores[result] += 1;
    updateStatus(`${result} wins this round`);
    window.setTimeout(() => {
      showWinnerModal(result);
    }, 80);
  }

  updateScores();
  renderBoard();
}

function switchTurn() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";

  if (gameMode === "friend") {
    updateStatus(`Player ${currentPlayer}'s turn`);
  } else if (!gameOver) {
    if (currentPlayer === HUMAN_PLAYER) {
      updateStatus("Your turn");
    } else {
      updateStatus("AI is thinking...");
    }
  }
}

function getAvailableMoves(state) {
  const available = [];
  state.forEach((value, index) => {
    if (value === "") {
      available.push(index);
    }
  });
  return available;
}

function minimax(state, player) {
  const result = evaluateWinner(state);
  if (result === HUMAN_PLAYER) {
    return { score: -10 };
  }
  if (result === AI_PLAYER) {
    return { score: 10 };
  }
  if (result === "draw") {
    return { score: 0 };
  }

  const moves = [];
  const availableMoves = getAvailableMoves(state);

  for (const index of availableMoves) {
    const move = { index };
    state[index] = player;

    if (player === AI_PLAYER) {
      move.score = minimax(state, HUMAN_PLAYER).score;
    } else {
      move.score = minimax(state, AI_PLAYER).score;
    }

    state[index] = "";
    moves.push(move);
  }

  let bestMove = 0;

  if (player === AI_PLAYER) {
    let bestScore = -Infinity;
    moves.forEach((move, index) => {
      if (move.score > bestScore) {
        bestScore = move.score;
        bestMove = index;
      }
    });
  } else {
    let bestScore = Infinity;
    moves.forEach((move, index) => {
      if (move.score < bestScore) {
        bestScore = move.score;
        bestMove = index;
      }
    });
  }

  return moves[bestMove];
}

function playAIMove() {
  if (gameOver || gameMode !== "ai" || currentPlayer !== AI_PLAYER) {
    return;
  }

  const bestMove = minimax([...boardState], AI_PLAYER);
  if (!bestMove || typeof bestMove.index !== "number") {
    return;
  }

  boardState[bestMove.index] = AI_PLAYER;

  const result = evaluateWinner(boardState);
  if (result) {
    setGameResult(result);
    return;
  }

  switchTurn();
  renderBoard();
}

function handleMove(index) {
  if (gameOver || boardState[index] !== "" || !gameMode) {
    return;
  }

  boardState[index] = currentPlayer;

  const result = evaluateWinner(boardState);
  if (result) {
    setGameResult(result);
    return;
  }

  switchTurn();
  renderBoard();

  if (gameMode === "ai" && currentPlayer === AI_PLAYER && !gameOver) {
    window.setTimeout(playAIMove, 320);
  }
}

function startRound() {
  hideWinnerModal();
  boardState = Array(9).fill("");
  gameOver = false;
  currentPlayer = "X";
  newRoundBtn.disabled = false;

  if (gameMode === "friend") {
    updateStatus("Player X starts");
  } else {
    updateStatus("Your turn");
  }

  renderBoard();
}

function setMode(mode) {
  gameMode = mode;
  updateModeText();
  modeModal.classList.add("hidden");
  startRound();
}

cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    handleMove(Number(cell.dataset.index));
  });
});

newRoundBtn.addEventListener("click", () => {
  if (!gameMode) {
    return;
  }
  startRound();
});

changeModeBtn.addEventListener("click", () => {
  hideWinnerModal();
  gameMode = null;
  updateModeText();
  gameOver = true;
  boardState = Array(9).fill("");
  updateStatus("Choose a mode to begin");
  modeModal.classList.remove("hidden");
  newRoundBtn.disabled = true;
  renderBoard();
});

friendModeBtn.addEventListener("click", () => setMode("friend"));
aiModeBtn.addEventListener("click", () => setMode("ai"));
winnerOkBtn.addEventListener("click", hideWinnerModal);
winnerModal.addEventListener("click", (event) => {
  if (event.target === winnerModal) {
    hideWinnerModal();
  }
});

updateScores();
updateModeText();
renderBoard();
