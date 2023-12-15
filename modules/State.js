export class State {
    constructor() {
        this.state = 0;
    }
    neutral(){
        this.state = 0;
    }
    selectPiece(){
        this.state = 1;
    }
    waitinForSelection(){
        this.state = 2;
    }
    kingUnderAttack(){
        this.state = 3;
    }
    kingMoveUnderAttack(){
        this.state = 4;
    }
    checkMate(){
        this.state = 5;
    }
}