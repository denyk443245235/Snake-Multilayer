import React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { SnakeAction } from '../Snake/snakeAction';
import { Game } from '../game';
interface Props {
    block: Block;
    game: Game;
}
export class Block {
    @observable coordinate = {
        x: 0,
        y: 0
    }
    constructor(public type: string, coordinate: { x: number, y: number },public color:string ) {
        this.coordinate = coordinate;
    }
}
@observer
export default class BlockComponent extends React.Component<Props>{
    game: Game;
    block: Block;
    coordinate: { x: number, y: number };
    action: SnakeAction | undefined;
    color:string;
    constructor(props: Props) {
        super(props);
        this.coordinate = this.props.block.coordinate;
        this.game = this.props.game;
        this.block = this.props.block;
        this.color = this.block.color;
        if (this.block.type == 'head') {
            this.action = new SnakeAction(this.game);
        }
    }
    render() {
        if (this.action) {
            this.action.eatBall(this.coordinate);
        }
        let { x, y } = this.coordinate;
        return (
            <rect x={x} y={y} width="10" height="10" fill={this.color} />
        )
    }
}