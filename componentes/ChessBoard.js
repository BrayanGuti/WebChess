import { State } from "../modules/State.js";
import { Turn } from "../modules/Turn.js";
import { Watch } from "../modules/Watch.js";

import "./ChessCells.js";

class ChessBoard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.State = new State();
    this.Turn = new Turn();
    this.TargetCell = [];
    this.selectedPiece = null;
    this.watchCell = [];
    this.wachedPiece = null;
    this.kings = [];
  }

  static get styles() {
    return /* css */`
      :host {
        --board-size: 430px;
        --phone-board-size: 300px;
        --cell-size: calc(var(--board-size) / 8);
        --phone-cell-size: calc(var(--phone-board-size) / 8);
        --BeigeClaro: #F0D9B5;
        --verdeOscuro: #006400;
        --blancoOpaco: #CECFC9;
        --azulOscuro: #0A3143;
        --blanco: #ffffff;
        --azulClaro: #276E90;
        --negro: #000000;
      }

      .sombra{
        display: flex;
        justify-content: center;
        align-items: center;
        height: calc(var(--phone-board-size) + 4rem);
        width: calc(var(--phone-board-size) + 4rem);
        background-color: var(--blancoOpaco);
        outline: 1px solid rgba(10, 49, 67, 0.5);;
      }
      
      @media (min-width: 768px) { 
        .sombra{
          height: calc(var(--board-size) + 4rem);
          width: calc(var(--board-size) + 4rem);
        }
      }

      .board {
        outline: 2px solid black;
        height: var(--phone-board-size);
        width: var(--phone-board-size);
        display: flex;
        flex-wrap: wrap;
        border: black 
        box-shadow: 0 0 0 2px black;
      }
      @media (min-width: 768px) { 
        .board {
          height: var(--board-size);
          width: var(--board-size);
        }
      }
    `;
  }

  connectedCallback() {
    this.render();
    
  }

  // CELLS
  renderCell(x,char, color){
    const board = this.shadowRoot.querySelector(".board");
    const cell  = document.createElement("chess-cell"); 
    cell.setAttribute("place", ( char + (x).toString()));  
    cell.setAttribute("color", color);
    cell.addEventListener("click", () => { this.onClicks(cell)}); 
    board.appendChild(cell);
  }

  renderCells(){
    let cells = [];
    const letras = "abcdefgh";
    for (let x = 8; x > 0; x--){
      let i = 0
      Array.from(letras).forEach((char) => {
        i++;
        let color;
        if (i %2 === 1 && x%2 === 0){
          color = "white"
        }else if(i %2 === 0 && x%2 === 1){
          color = "white"
        }else{
          color = "black"
        }
        cells.push(this.renderCell(x,char, color));
      });
    }
    return cells.join(""); 
  }

  getCell(place){
    const celda = this.shadowRoot.querySelector(`[place="${place}"]`);
    const divEnShadow = celda.shadowRoot.querySelector('.celda');
    return divEnShadow;
  }

  


  // PEACES
  putPiece(){
    const pieces = [
      { type: "wp", position: ["a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"] },
      { type: "wr", position: ["a1", "h1"] },
      { type: "wn", position: ["b1", "g1"] },
      { type: "wb", position: ["c1", "f1"] },
      { type: "wq", position: ["d1"] },
      { type: "wk", position: ["e1"] },
      { type: "bp", position: ["a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"] },
      { type: "br", position: ["a8", "h8"] },
      { type: "bn", position: ["b8", "g8"] },
      { type: "bb", position: ["c8", "f8"] },
      { type: "bq", position: ["d8"] },
      { type: "bk", position: ["e8"] }
    ];
    
    pieces.forEach(piece => {
      piece.position.forEach(pos => {
        this.renderPieces(piece.type, pos);
      });
    }); 
  }

  renderPieces(piece, place){ 
    const celda = this.getCell(place);
    celda.innerHTML = /* html */`<chess-pieces firstMove="True" piece="${piece}"></chess-pieces>`;
  }

  // EVENTS
  onClicks(cell) {
    const piece = cell.shadowRoot.querySelector("chess-pieces");

    if (this.State.state === 0 && piece && piece.piece[0] === this.Turn.turn) {
      this.selectedPiece = piece;
      this.selectedPiece.classList.add("selected");
      this.State.selectPiece(); 
      this.showPosition(piece, cell);
    
    } else if(this.State.state === 1 && piece === this.selectedPiece){
      this.clearObjectiveCells();
      this.selectedPiece.classList.remove("selected");
      this.selectedPiece = null;
      this.State.neutral();
    
    }else if (this.State.state === 1) {
      if(this.TargetCell.includes(cell.shadowRoot.querySelector(".celda"))) {
        this.movePieces(cell.shadowRoot.querySelector(".celda"));

      } else if(piece && piece.piece[0] === this.Turn.turn) {
        this.clearObjectiveCells();
        this.selectedPiece.classList.remove("selected");
        this.selectedPiece = piece;
        this.showPosition(piece, cell);
        this.selectedPiece.classList.add("selected");
      }
    }else if(this.State.state === 2 && this.selection.contains(cell)){
      this.selectedPiece.innerHTML = /* html */`<chess-pieces piece="${piece.piece}"></chess-pieces>`;
      this.selection.remove();
      this.selection = null;
      this.State.neutral();   
      this.selectedPiece = null;
      this.watch();
    }else if(this.State.state === 3 && piece){
        if(piece.piece[1] === "k" && piece.piece[0] === this.Turn.turn){
          this.selectedPiece = piece;
          this.State.kingMoveUnderAttack(); 
          this.showPosition(piece, cell);
        }
    }else if(this.State.state === 4 && this.TargetCell.includes(cell.shadowRoot.querySelector(".celda"))){
      this.movePieces(cell.shadowRoot.querySelector(".celda"));
    }
  }

  showPosition(chessPiece, cell, watch = false) {
    const color = chessPiece.piece[0];
    const piece = chessPiece.piece[1];
    const row = cell.getAttribute("place")[0];
    const column = cell.getAttribute("place")[1];
    if(!watch){
      this.TargetCell = [];
    }

    if (piece === "p") {    
      // advance
      let direction = (color === "b") ? -1 : 1;
      let advance = (parseInt(column) + direction).toString();
      
      if(!watch){
        
        const cellAdvance = this.getCell(row + advance);
        this.addTargetCell(cellAdvance);
      
        // firstMove
        if (((column === "2" && direction === 1) || (column === "7" && direction === -1)) && (cellAdvance.querySelector("chess-pieces") === null)) {
          const cellAdvance2 = this.getCell(row + (parseInt(advance) + direction).toString() );
          this.addTargetCell(cellAdvance2);
        }

      }
      
    
      // attack
      for (let i = -1; i < 2; i += 2) {
        const coords = this.shiftedLetter(row, i) + advance;
        if(coords[0] != "o" && coords[1] != "0" && coords[2] != "9"){
          const cellUnderAttack = this.getCell(coords);
          if(!watch){
            this.addTargetCell(cellUnderAttack, true);
          }else{
            this.addWatchCell(cellUnderAttack);
          }
        }
      }
    }

    else if(piece === "r"){
      const rookMoves = [
        { x: -1, y: 0 }, // LEFT
        { x: +1, y: 0 }, // RIGHT
        { x: 0, y: -1 }, // DOWN
        { x: 0, y: +1 }, // UP
      ];
      
      rookMoves.forEach(move => {
        this.searchDirection(row, column, move.x, move.y, watch, color);
      });      
    }
    
    else if(piece === "n"){
      const moves = [
        {x: -2, y: -1},
        {x: -2, y: +1},
        {x: -1, y: -2},
        {x: -1, y: +2},
        {x: +1, y: -2},
        {x: +1, y: +2},
        {x: +2, y: -1},
        {x: +2, y: +1},
      ];
      moves.forEach(move => {
        const coords = this.shiftedLetter(row, move.x) + (parseInt(column) + move.y).toString();

        if(coords[0] != "o" && parseInt(coords[1]) > 0 && parseInt(coords[1]) < 9 && !coords[2]){
          const NewCell = this.getCell(coords);
          if(!watch){
            if(NewCell.querySelector("chess-pieces") != null){
              
              if(NewCell.querySelector("chess-pieces").piece[0] != this.selectedPiece.piece[0]){
                this.addTargetCell(NewCell, true);
              }
            }else{
              this.addTargetCell(NewCell);
            }
          }else{
            this.addWatchCell(NewCell);
          }
        }
     
      });
    }
    
    else if(piece === "b"){
      const diagonalMoves = [
        { x: +1, y: +1 }, // UP LEFT
        { x: +1, y: -1 }, // UP RIGHT
        { x: -1, y: +1 }, // DOWN LEFT
        { x: -1, y: -1 }, // DOWN RIGHT
      ];
      
      diagonalMoves.forEach(move => {
        this.searchDirection(row, column, move.x, move.y, watch, color);
      });      
    }
    
    else if(piece === "q"){
      const diagonalMoves = [
        { x: +1, y: +1 }, // UP LEFT
        { x: +1, y: -1 }, // UP RIGHT
        { x: -1, y: +1 }, // DOWN LEFT
        { x: -1, y: -1 }, // DOWN RIGHT
      ];
      
      diagonalMoves.forEach(move => {
        this.searchDirection(row, column, move.x, move.y, watch, color);
      });      

      const rookMoves = [
        { x: -1, y: 0 }, // LEFT
        { x: +1, y: 0 }, // RIGHT
        { x: 0, y: -1 }, // DOWN
        { x: 0, y: +1 }, // UP
      ];
      
      rookMoves.forEach(move => {
        this.searchDirection(row, column, move.x, move.y, watch, color);
      });      
    }

    else if(piece === "k"){
      const moves = [
        {x: -1, y: -1},
        {x: -1, y: +1},
        {x: -1, y: 0},
        {x: 0, y: -1},
        {x: 0, y: +1},
        {x: +1, y: -1},
        {x: +1, y: +1},
        {x: +1, y: 0},
      ];
      if(!watch){
        if(chessPiece.getAttribute("firstMove") === "True"){
          this.castling(column, color);
        }
      }

      moves.forEach(move => {
        const coords = this.shiftedLetter(row, move.x) + (parseInt(column) + move.y).toString();

        if(coords[0] != "o" && parseInt(coords[1]) > 0 && parseInt(coords[1]) < 9){
          const NewCell = this.getCell(coords);
          if(!watch){
            if(NewCell.querySelector("chess-pieces") != null){
              if(this.allowKingToMove(NewCell, color)){
                if(NewCell.querySelector("chess-pieces").piece[0] != color){
                  this.addTargetCell(NewCell, true);
                }
              }
              
            }else{
              if(this.allowKingToMove(NewCell, color)){
                this.addTargetCell(NewCell);
              }
            }

          }else{
            this.addWatchCell(NewCell);
          }
        }
     
      });
    }
    
    if(!watch){
      this.TargetCell.forEach(cell => {
          if(cell.underAttack){
            cell.classList.add("underAttack");
          }
          cell.appendChild(this.createTargetElement(cell.underAttack));
      });
    }
  }

  castling(column, color) {
    const towerPositions = [["a" + column, "c" + column, -1], ["h" + column, "g" + column, +1]];
    const kingPosition = "e" + column;
    let currentCell;
    let row;
  
    const opposingColor = color === "w" ? "b" : "w";
    for (const position of towerPositions) {
      let canCastle = true;
      currentCell = kingPosition;
      while(currentCell !== position[0]){
        row = this.shiftedLetter(currentCell[0], position[2]);
        const cell = this.shadowRoot.querySelector(`[place="${row + column}"]`);
        if(row !== position[0][0]){
          if(cell.shadowRoot.querySelector(".celda").getAttribute(opposingColor) === opposingColor || cell.shadowRoot.querySelector("chess-pieces") !== null){            
            console.log(row + column)
            canCastle = false;
            break;
          }
        }else{
          if(cell.shadowRoot.querySelector(".celda").getAttribute(opposingColor) === opposingColor){
            console.log(row + column)
            canCastle = false;
            break;
          }
        }
        
        currentCell = row + column;
      }
      if(canCastle === true){
        const cellTower = this.shadowRoot.querySelector(`[place="${position[0]}"]`);
    
        if (cellTower.shadowRoot.querySelector("chess-pieces") !== null) {
          const towerPiece = cellTower.shadowRoot.querySelector("chess-pieces");
    
          if (towerPiece.getAttribute("firstMove") === "True" && towerPiece.getAttribute("piece")[1] === "r") {
            this.addTargetCell(this.getCell(position[1]));
          }
        }
      }
    }
  }
  
  allowKingToMove(cell, color){
    if ((color === "w" && cell.getAttribute("b") === "b") || (color === "b" && cell.getAttribute("w") === "w")) {
      return false;
    }
    return true;
  }

  addWatchCell(cell){
    const color = this.wachedPiece.piece[0];
    if(color === "w"){
      cell.setAttribute("w", color);
    }else{
      cell.setAttribute("b", color);
    }
    this.watchCell.push(cell);
  }

searchDirection(row, column, horizontalIncrease, verticalIncrease, watch, color) {
  const opposingColor = color === "w" ? "b" : "w";
  while (this.isValidCell(row, column)) {
    row = this.shiftedLetter(row, horizontalIncrease);
    column = (parseInt(column) + verticalIncrease).toString();

    if (this.isValidCell(row, column)) {
      const cellNext = this.getCell(row + column);
      const hasChessPiece = cellNext.querySelector("chess-pieces") !== null;

      watch ? this.addWatchCell(cellNext) : this.addTargetCell(cellNext, hasChessPiece);
      if(hasChessPiece){ 
        console.log(opposingColor + "k"	)
        if (watch && cellNext.querySelector("chess-pieces").piece !== opposingColor + "k") {
          return;
        } else if (!watch) {
          return;
        }        
      }
    } else {
      return;
    }
  }
}


isValidCell(row, column) {
  return row !== "o" && column !== "0" && column !== "9";
}



  movePieces(destiny){
    this.Turn.next();
    this.clearObjectiveCells();
    destiny.innerHTML = /* html */`<chess-pieces piece="${this.selectedPiece.piece}"></chess-pieces>`;

    if(this.selectedPiece.piece[1] === "p" && (destiny.id[1] === "8" || destiny.id[1] === "1") ){
      this.selectedPiece.remove();
      this.upGradePawn(destiny);
    }  
    else{
      this.selectedPiece.remove();
      this.State.neutral();   
      this.selectedPiece = null;
      this.watch();
    }
    
  }

  upGradePawn(cell){
    this.State.waitinForSelection();
    this.selection = document.createElement("div");
    const board = document.querySelector(".contenedor");
    const pieces = ["q", "r", "n", "b"];
    
    this.selection.classList.add("selection");
    board.appendChild(this.selection);
    
    pieces.forEach(piece => {
      const newCell  = document.createElement("chess-cell");  
      this.selection.appendChild(newCell);
      
      const divEnShadow = newCell.shadowRoot.querySelector('.celda');
      newCell.addEventListener("click", () => { this.onClicks(newCell)}); 

      
      divEnShadow.innerHTML = /* html */`<chess-pieces piece="${this.selectedPiece.piece[0] + piece}"></chess-pieces>`;
      
    });
    this.selectedPiece = cell;
  }

  watch(){
    this.eliminateWatchedCells();
    const chessCells = this.shadowRoot.querySelectorAll("chess-cell");
    chessCells.forEach(cell => {  
      const piece = cell.shadowRoot.querySelector("chess-pieces");
      this.wachedPiece = piece;

      if(piece){
        if(piece.piece[1] === "k"){
          this.kings.push([cell.shadowRoot.querySelector(".celda"), piece.piece[0], cell]);
        }
        this.showPosition(piece, cell, true);
      }
    });
    this.kingsUnderAttack();
  }

  eliminateWatchedCells(){
    if(this.kings.length > 0){
      this.kings.forEach(king => {
        const kingColor = king[1];
        const opposingColor = kingColor === "w" ? "b" : "w";
        
        if (king[0].getAttribute(opposingColor) === opposingColor) {
          king[0].classList.remove("kingUnderAttack");
          king[0].classList.add(king[2].getAttribute("color"));
        }
        
      });
    }
    this.kings = [];
    this.watchCell.forEach(cell => {
      cell.setAttribute("w", "null");
      cell.setAttribute("b", "null");
    });
    this.watchCell = [];
  }

  kingsUnderAttack(){
    this.kings.forEach(king => {
      const kingColor = king[1];
      const opposingColor = kingColor === "w" ? "b" : "w";
      
      if (king[0].getAttribute(opposingColor) === opposingColor) {
        king[0].classList.remove(king[2].getAttribute("color"));
        king[0].classList.add("kingUnderAttack");
        if( !(this.possibleCheckMate(king)) ){
          this.State.checkMate();
          let winner;
          if(opposingColor === "w"){
            winner = "Whites" 
          }else{
            winner = "Blacks "
          }
          
          // this.gameOver();
          console.log(winner  + " wins")
          return;
        }
        this.State.kingUnderAttack();
      }
      
    });
  }

  possibleCheckMate(king) {
    const color = king[2].shadowRoot.querySelector("chess-pieces").piece[0];
    const row = king[2].getAttribute("place")[0];
    const column = king[2].getAttribute("place")[1];
    const moves = [
      {x: -1, y: -1},
      {x: -1, y: +1},
      {x: -1, y: 0},
      {x: 0, y: -1},
      {x: 0, y: +1},
      {x: +1, y: -1},
      {x: +1, y: +1},
      {x: +1, y: 0},
    ];
  
    for (const move of moves) {
      const coords = this.shiftedLetter(row, move.x) + (parseInt(column) + move.y).toString();
  
      if (coords[0] != "o" && parseInt(coords[1]) > 0 && parseInt(coords[1]) < 9) {
        const newCell = this.getCell(coords);
  
        if (newCell.querySelector("chess-pieces") != null) {
          if (this.allowKingToMove(newCell, color) && newCell.querySelector("chess-pieces").piece[0] != color) {
            return true; 
          }
        } else {
          if (this.allowKingToMove(newCell, color)) {
            return true; 
          }
        }
      }
    }
  
    return false; 
  }
  
  // HELP FUNCTION
  addTargetCell(cell,  underAttack = false) {
    if (cell.querySelector("chess-pieces") === null && !underAttack) {
      this.TargetCell.push(cell);
    }

    if(cell.querySelector("chess-pieces") != null){
      if(underAttack && cell.querySelector("chess-pieces").piece[0] != this.selectedPiece.piece[0]){
        cell.underAttack = true;
        this.TargetCell.push(cell);
      }
    }
    
  }
  
  shiftedLetter(letter, number) {
    const allowedLetters = ["a", "b","c", "d", "e", "f", "g", "h"];  
    const initialIndex = allowedLetters.indexOf(letter);
    let newIndex = initialIndex + number;
  
    if (newIndex > 7 || newIndex < 0) {
      return "o";  // out of bounds
    }
 
    return allowedLetters[newIndex];
  }

  createTargetElement(underAttack = false) {
    if(underAttack){
      const objetiveCell = document.createElement("div");
      objetiveCell.classList.add("underAttack__circle");
      return objetiveCell;
    }
    const objetiveCell = document.createElement("div");
    objetiveCell.classList.add("objetive");
    return objetiveCell;
  }

  clearObjectiveCells() {
    this.TargetCell.forEach(cell => {
      const objective = cell.querySelector("div");
      cell.removeChild(objective);
      if(cell.underAttack){
        cell.classList.remove("underAttack");
        cell.underAttack = false;
      }
    });
  }

  // RENDER
  render() {
    this.shadowRoot.innerHTML = /* html */`
    <style>${ChessBoard.styles}</style>
    <div class="sombra">
      <div class="board">
        
      </div>
    </div>`;
    this.renderCells()
  }
}


customElements.define("chess-board", ChessBoard);