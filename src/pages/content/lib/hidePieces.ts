function initialStealth() {
  // Define the starting positions of the pieces
  const startingPositions = {
    br: ['88', '18'],
    bn: ['78', '28'],
    bb: ['68', '38'],
    bk: ['58'],
    bq: ['48'],
    bp: ['87', '77', '67', '57', '47', '37', '27', '17'],
    wr: ['81', '11'],
    wn: ['71', '21'],
    wb: ['61', '31'],
    wq: ['41'],
    wk: ['51'],
    wp: ['82', '72', '62', '52', '42', '32', '22', '12'],
  };

  // Function to hide all pieces on their starting squares
  function hidePiecesOnStartingSquares() {
    Object.entries(startingPositions).forEach(([piece, squares]) => {
      squares.forEach(square => {
        const selector = `.piece.${piece}.square-${square}`;
        const element = document.querySelector(selector);
        if (element) {
          element.style.opacity = '0';
          element.setAttribute('data-initial-square', `square-${square}`);
        }
      });
    });
  }

  // Function to reveal a piece
  function revealPiece(piece) {
    const initialSquare = piece.getAttribute('data-initial-square');
    const currentSquare = piece.classList.contains(initialSquare);
    if (!currentSquare) {
      piece.style.opacity = '1';
      piece.removeAttribute('data-initial-square');
    }
  }

  // Observe changes in class attribute of each piece
  function observePieceMoves() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          revealPiece(mutation.target);
        }
      });
    });

    // Options for the observer (which mutations to observe)
    const config = { attributes: true, attributeFilter: ['class'], subtree: true };

    // Start observing all pieces
    document.querySelectorAll('.piece').forEach(piece => {
      observer.observe(piece, config);
    });
  }

  // Hide pieces on starting squares initially
  hidePiecesOnStartingSquares();

  // Start observing piece moves
  observePieceMoves();
}

export function hidePieces() {
  // Function to check for the element and run your script
  function runScriptIfElementPresent() {
    const chessBoard = document.querySelector('wc-chess-board');
    if (chessBoard) {
      setTimeout(initialStealth, 500); // Run the stealth function if the chess board is present
      observer.disconnect(); // Stop observing once the element is found and the script is run
    }
  }

  // Set up a MutationObserver to watch for changes in the document
  const observer = new MutationObserver(function () {
    runScriptIfElementPresent();
  });

  // Start observing the document body for childList changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Initial check in case the element is already present
  runScriptIfElementPresent();

  return observer; // Return the observer in case you need to disconnect it outside this function
}

// Function to check if any piece is hidden
export function isAnyPieceHidden() {
  // Returns true if any piece with the data-initial-square attribute exists
  return !!document.querySelector('.piece[data-initial-square]');
}

// Function to reveal all pieces
export function showPieces() {
  // Select all pieces and set their opacity to 1 and remove the data-initial-square attribute
  document.querySelectorAll('.piece').forEach(function (piece) {
    piece.style.opacity = '1';
    piece.removeAttribute('data-initial-square');
  });
}
