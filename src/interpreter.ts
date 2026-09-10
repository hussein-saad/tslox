import {
  Assign,
  Binary,
  Call,
  Comma,
  Expr,
  Get,
  Grouping,
  Literal,
  Logical,
  Set,
  Super,
  Ternary,
  This,
  Unary,
  Variable,
  Visitor,
} from './expression';
import { RuntimeError } from './runtimeerror';
import { Token } from './token';
import { TokenType } from './token-type';
import { Lox } from './lox';
import { Stmt, StmtVisitor, Print, Expression, Var, Block } from './stmt';
import { Environment } from './environment';
export class Interpreter implements Visitor<Object>, StmtVisitor<void> {
  private environment: Environment = new Environment();

  visitBlockStmt(stmt: Block): void {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  visitExpressionStmt(stmt: Expression): void {
    this.evaluate(stmt.expression);
  }

  visitPrintStmt(stmt: Print): void {
    const value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
  }

  visitVariableStmt(stmt: Var): void {
    var value: Object = null;
    if (stmt.initializer !== null) {
      value = this.evaluate(stmt.initializer);
    }
    this.environment.define(stmt.name.lexeme, value);
  }

  visitLiteralExpr(expr: Literal): Object {
    return expr.value;
  }

  visitGroupingExpr(expr: Grouping): Object {
    return this.evaluate(expr.expression);
  }

  visitUnaryExpr(expr: Unary): Object {
    const right = this.evaluate(expr.right);
    switch (expr.operator.type) {
      case TokenType.MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -(right as number);
      case TokenType.BANG:
        return !this.isTruthy(right);
    }

    return null;
  }

  visitBinaryExpr(expr: Binary): Object {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) - (right as number);
      case TokenType.PLUS:
        if (typeof left === 'number' && typeof right === 'number') {
          return (left as number) + (right as number);
        }
        if (typeof left === 'string' || typeof right === 'string') {
          return left.toString() + right.toString();
        }
        throw new RuntimeError(
          expr.operator,
          'Operands must be numbers or strings.',
        );
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) / (right as number);
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) * (right as number);

      case TokenType.GREATER:
        this.checkNumberOrStringsOperands(expr.operator, left, right);
        return left > right;
      case TokenType.GREATER_EQUAL:
        this.checkNumberOrStringsOperands(expr.operator, left, right);
        return left >= right;
      case TokenType.LESS:
        this.checkNumberOrStringsOperands(expr.operator, left, right);
        return left < right;
      case TokenType.LESS_EQUAL:
        this.checkNumberOrStringsOperands(expr.operator, left, right);
        return left <= right;
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
    }
  }

  visitAssignExpr(expr: Assign): Object {
    const value = this.evaluate(expr.value);
    this.environment.assign(expr.name, value);
    return value;
  }

  visitCallExpr(expr: Call): Object {
    throw new Error('Method not implemented.');
  }

  visitGetExpr(expr: Get): Object {
    throw new Error('Method not implemented.');
  }

  visitSetExpr(expr: Set): Object {
    throw new Error('Method not implemented.');
  }

  visitThisExpr(expr: This): Object {
    throw new Error('Method not implemented.');
  }

  visitSuperExpr(expr: Super): Object {
    throw new Error('Method not implemented.');
  }

  visitLogicalExpr(expr: Logical): Object {
    throw new Error('Method not implemented.');
  }

  visitVariableExpr(expr: Variable): Object {
    return this.environment.get(expr.name);
  }

  visitCommaExpr(expr: Comma): Object {
    throw new Error('Method not implemented.');
  }

  visitTernaryExpr(expr: Ternary): Object {
    const condition = this.evaluate(expr.condition);
    if (this.isTruthy(condition)) {
      return this.evaluate(expr.thenBranch);
    } else {
      return this.evaluate(expr.elseBranch);
    }
  }

  private evaluate(expr: Expr): Object {
    return expr.accept(this);
  }
  // the falsy values are null and false, and zero
  private isTruthy(object: Object): boolean {
    if (object === null) return false;
    if (typeof object === 'number' && object === 0) return false;
    if (typeof object === 'boolean') return object as boolean;
    return true;
  }

  private isEqual(left: Object, right: Object): boolean {
    if (left === null && right === null) return true;
    if (left === null) return false;

    return left === right;
  }

  private checkNumberOperand(operator: Token, operand: Object) {
    if (typeof operand === 'number') return;
    throw new RuntimeError(operator, 'Operand must be a number.');
  }

  private checkNumberOperands(operator: Token, left: Object, right: Object) {
    if (typeof left === 'number' && typeof right === 'number') return;
    throw new RuntimeError(operator, 'Operands must be numbers.');
  }

  private checkNumberOrStringsOperands(
    operator: Token,
    left: Object,
    right: Object,
  ) {
    if (
      (typeof left === 'number' && typeof right === 'number') ||
      (typeof left === 'string' && typeof right === 'string')
    )
      return;
    throw new RuntimeError(
      operator,
      'Operands must be both numbers or both strings.',
    );
  }

  private stringify(object: Object): string {
    if (object === null) return 'nil';

    if (typeof object === 'number') {
      let text = object.toString();
      if (text.endsWith('.0')) {
        text = text.substring(0, text.length - 2);
      }
      return text;
    }
    return object.toString();
  }

  interpret(statements: Stmt[]): void {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (error) {
      if (error instanceof RuntimeError) {
        Lox.runtimeError(error);
        return;
      }
    }
  }

  interpretRepl(statements: Stmt[]): void {
    try {
      for (const statement of statements) {
        if (statement instanceof Expression) {
          console.log(this.stringify(this.evaluate(statement.expression)));
        } else {
          this.execute(statement);
        }
      }
    } catch (error) {
      if (error instanceof RuntimeError) {
        Lox.runtimeError(error);
      }
    }
  }

  private execute(stmt: Stmt): void {
    stmt.accept(this);
  }

  executeBlock(statements: Stmt[], environment: Environment): void {
    const previous: Environment = this.environment;
    try {
      this.environment = environment;

      for (const statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = previous;
    }
  }
}
