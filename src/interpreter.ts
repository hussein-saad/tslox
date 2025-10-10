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

export class Interpreter implements Visitor<Object> {
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
        if (typeof left === 'string' && typeof right === 'string') {
          return left + right;
        }
        if (typeof left === 'number' && typeof right === 'number') {
          return (left as number) + (right as number);
        }
        throw new RuntimeError(
          expr.operator,
          'Operands must be both numbers or both strings.',
        );
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) / (right as number);
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) * (right as number);

      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) > (right as number);
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) >= (right as number);
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) < (right as number);
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) <= (right as number);
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
    }
  }

  visitAssignExpr(expr: Assign): Object {
    throw new Error('Method not implemented.');
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
    throw new Error('Method not implemented.');
  }

  visitCommaExpr(expr: Comma): Object {
    throw new Error('Method not implemented.');
  }

  visitTernaryExpr(expr: Ternary): Object {
    throw new Error('Method not implemented.');
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

  interpret(expression: Expr): void {
    try {
      const value = this.evaluate(expression);
      console.log(this.stringify(value));
    } catch (error) {
      if (error instanceof RuntimeError) {
        Lox.runtimeError(error);
        return;
      }
      throw error;
    }
  }
}
