import "./componentes/ChessBoard.js"
import "./componentes/ChessCells.js"
import "./componentes/ChessPieces.js"




const chessBoard = document.querySelector("chess-board");

// Llamar a una función putPiece en chessBoard
// chessBoard.putPiece();



chessBoard.renderPieces("wk", "e1")
chessBoard.renderPieces("wr", "a1")
chessBoard.renderPieces("wr", "h1")
chessBoard.renderPieces("bk", "b5")
chessBoard.renderPieces("bq", "c5")
chessBoard.renderPieces("wp", "c7")

