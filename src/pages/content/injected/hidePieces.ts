function initialStealth() {
  // Function to hide all pieces and store their initial square
  function hideAllPiecesAndStoreInitialSquare() {
    console.log('hideAllPiecesAndStoreInitialSquare');
    document.querySelectorAll('.piece').forEach(function (piece) {
      const squareClass = [...piece.classList].find(cls => cls.startsWith('square-'));
      if (squareClass) {
        piece.setAttribute('data-initial-square', squareClass); // Store initial square
      }
      piece.style.opacity = '0'; // Hide the piece
    });
  }

  // Function to reveal a piece if it has moved
  function revealPieceIfMoved(mutation) {
    const piece = mutation.target;
    const currentSquareClass = [...piece.classList].find(cls => cls.startsWith('square-'));
    const initialSquareClass = piece.getAttribute('data-initial-square');

    // Reveal piece if it has moved
    if (currentSquareClass !== initialSquareClass) {
      piece.style.opacity = '1'; // Reveal the piece
      piece.removeAttribute('data-initial-square'); // Clear stored initial position
    }
  }

  // Observe changes in class attribute of each piece
  function observePieceMoves() {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          revealPieceIfMoved(mutation);
        }
      });
    });

    // Options for the observer (which mutations to observe)
    const config = { attributes: true, attributeFilter: ['class'] };

    // Add observer to each piece
    document.querySelectorAll('.piece').forEach(function (piece) {
      observer.observe(piece, config);
    });
  }

  // Hide all pieces initially and store their initial square
  hideAllPiecesAndStoreInitialSquare();

  // Start observing piece moves
  observePieceMoves();
}

(function () {
  // Function to check for the element and run your script
  function runScriptIfElementPresent() {
    const chessBoard = document.querySelector('wc-chess-board');
    if (chessBoard) {
      console.log('<wc-chess-board /> is present. Running the script...');
      initialStealth();
      // Place your script's main functionality here
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
})();
