import { TokenType } from "./token-type";

export class Token {
    constructor(
        public readonly type: TokenType,
        public readonly lexeme: string,
        public readonly literal: any,
        public readonly line: number
    ) {}

    toString(): string {
        return `${TokenType[this.type]} ${this.lexeme} ${this.literal}`;
    }
}