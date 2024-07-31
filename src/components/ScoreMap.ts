export class ScoreMap {

    Scores: number[][];
    state: number[][];
    numberSet: Set<number> = new Set<number>();

    constructor() {
        this.Scores = [];
        this.state = [];
        for (let i = 0; i < 20; i++) {
            this.Scores[i] = [];
            this.state[i] = [];
            for (let j = 0; j < 20; j++) {
                this.Scores[i][j] = 0;
                this.state[i][j] = 0;
            }
        }
        this.create();
    }
    create() {
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                this.Scores[i][j] = Phaser.Math.Between(0, 100);
            }
        }
    }
    getScore() {
        return this.Scores;
    }
    getMap()
    {
        return this.state;
    }
    getPointScore(x: number, y: number) {
        return this.Scores[(x - 8) / 16][(y - 8) / 16];
    }
    getPointState(x: number, y: number) {
        return this.state[(x - 8) / 16][(y - 8) / 16];
    }
    createMap(scene: Phaser.Scene)
    {
        for(let i= 1; i <= 16; i++)
        {
            for(let j = 1; j <= 16;j++)
            {
                this.numberSet.add(this.Scores[i][j]);
            }
        }
        let step = 150 / this.numberSet.size;

        for(let i= 1; i <= 16; i++)
        {
            for(let j = 1; j <= 16;j++)
            {
                let count = -1;

                for(let k of this.numberSet)
                {
                    if(this.Scores[i][j] == k)
                    {
                        break;
                    }
                    count++;
                }
              //  console.log(count, this.Scores[i][j]);
                scene.add.rectangle(i * 16, j * 16, 16, 16, Phaser.Display.Color.GetColor(255, 80 + count * step, 0)).setOrigin(0, 0);
            }
        }
    }
    setState(x: number, y: number, state: number) {
        this.state[(x - 8) / 16][(y - 8) / 16] = state;
    }
}
