import {
  Expr,
  Visitor,
  Assign,
  Call,
  Get,
  Set,
  This,
  Super,
  Unary,
  Binary,
  Literal,
  Grouping,
  Logical,
  Variable,
  Comma,
} from './expression';

export class AstPrinter implements Visitor<string> {
  print(expr: Expr): string {
    return expr.accept(this);
  }

  visitAssignExpr(expr: Assign): string {
    return this.parenthesize(`= ${expr.name.lexeme}`, expr.value);
  }

  visitCallExpr(expr: Call): string {
    return this.parenthesize('call', expr.callee, ...expr.args);
  }

  visitGetExpr(expr: Get): string {
    return this.parenthesize(`get ${expr.name.lexeme}`, expr.object);
  }

  visitSetExpr(expr: Set): string {
    return this.parenthesize(
      `set ${expr.name.lexeme}`,
      expr.object,
      expr.value,
    );
  }

  visitThisExpr(expr: This): string {
    return `this`;
  }

  visitSuperExpr(expr: Super): string {
    return `super.${expr.method.lexeme}`;
  }

  visitUnaryExpr(expr: Unary): string {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  visitBinaryExpr(expr: Binary): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  visitLiteralExpr(expr: Literal): string {
    if (expr.value === null) return 'nil';
    return expr.value.toString();
  }

  visitGroupingExpr(expr: Grouping): string {
    return this.parenthesize('group', expr.expression);
  }

  visitLogicalExpr(expr: Logical): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  visitVariableExpr(expr: Variable): string {
    return expr.name.lexeme;
  }

  visitCommaExpr(expr: Comma): string {
    return this.parenthesize(',', ...expr.expressions);
  }

  private parenthesize(name: string, ...exprs: Expr[]): string {
    let result = `(${name}`;
    for (const expr of exprs) {
      result += ` ${expr.accept(this)}`;
    }
    result += ')';
    return result;
  }
}
