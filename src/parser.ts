import { Token } from './token';
import {
  Binary,
  Comma,
  Expr,
  Grouping,
  Literal,
  Ternary,
  Unary,
} from './expression';
import { TokenType } from './token-type';
import { Lox } from './lox';

export class Parser {
  private static ParseError = class ParseError extends Error {};

  private readonly tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Expr {
    try {
      return this.expression();
    } catch (error: any) {
      return null;
    }
  }

  // expression -> equality
  private expression(): Expr {
    return this.comma();
  }

  // conditional -> equality ("?" equality ":" conditional)?
  private ternary(): Expr {
    let expr: Expr = this.equality();

    if (this.match(TokenType.QUESTION)) {
      const thenBranch: Expr = this.equality();
      this.consume(
        TokenType.COLON,
        "Expect ':' after then branch of ternary operator.",
      );
      const elseBranch: Expr = this.ternary();
      expr = new Ternary(expr, thenBranch, elseBranch);
    }

    return expr;
  }

  // comma -> conditional ("," conditional)*
  private comma(): Expr {
    let expressions: Expr[] = [this.ternary()];

    while (this.match(TokenType.COMMA)) {
      expressions.push(this.ternary());
    }

    return expressions.length === 1 ? expressions[0] : new Comma(expressions);
  }

  // equality -> comparison ( ( "!=" | "==" ) comparison )*
  private equality(): Expr {
    // missing left operand
    const leftMissing = this.checkBinaryOperator([
      TokenType.BANG_EQUAL,
      TokenType.EQUAL_EQUAL,
    ]);

    if (leftMissing) return leftMissing;

    let expr: Expr = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator: Token = this.previous();
      const right: Expr = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  // comparison -> term ( ( ">" | ">=" | "<" | "<=" ) term )*
  private comparison(): Expr {
    // missing left operand
    const leftMissing = this.checkBinaryOperator([
      TokenType.GREATER,
      TokenType.GREATER_EQUAL,
      TokenType.LESS,
      TokenType.LESS_EQUAL,
    ]);

    if (leftMissing) return leftMissing;

    let expr: Expr = this.term();

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL,
      )
    ) {
      const operator: Token = this.previous();
      const right: Expr = this.term();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  // term -> factor ( ( "-" | "+" ) factor )*
  private term(): Expr {
    // missing left operand
    const leftMissing = this.checkBinaryOperator([TokenType.PLUS]);

    if (leftMissing) return leftMissing;

    let expr: Expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator: Token = this.previous();
      const right: Expr = this.factor();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  // factor -> unary ( ( "/" | "*" ) unary )*
  private factor(): Expr {
    // missing left operand
    const leftMissing = this.checkBinaryOperator([
      TokenType.SLASH,
      TokenType.STAR,
    ]);

    if (leftMissing) return leftMissing;

    let expr: Expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator: Token = this.previous();
      const right: Expr = this.unary();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  // unary -> ( "!" | "-" ) unary | primary
  private unary(): Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator: Token = this.previous();
      const right: Expr = this.unary();
      return new Unary(operator, right);
    }

    return this.primary();
  }

  // primary -> NUMBER | STRING | "true" | "false" | "nil" | "(" expression ")"
  private primary(): Expr {
    if (this.match(TokenType.TRUE)) {
      return new Literal(true);
    }

    if (this.match(TokenType.FALSE)) {
      return new Literal(false);
    }

    if (this.match(TokenType.NIL)) {
      return new Literal(null);
    }

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this.previous().literal);
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new Grouping(expr);
    }

    throw this.error(this.peek(), 'Expect expression.');
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw this.error(this.peek(), message);
  }

  private error(
    token: Token,
    message: string,
  ): InstanceType<(typeof Parser)['ParseError']> {
    Lox.error(token, message);
    return new Parser.ParseError();
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }

  // helper function to check for binary operator without left operand
  private checkBinaryOperator(types: TokenType[]): Expr | null {
    for (const type of types) {
      if (this.check(type)) {
        const operator: Token = this.advance();
        const right: Expr = this.equality();
        this.error(
          operator,
          `Binary operator '${operator.lexeme}' requires left operand.`,
        );
        return right;
      }
    }
    return null;
  }
}
