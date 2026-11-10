import { Interpreter } from './interpreter';
import { Lox } from './lox';
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
  Visitor as ExprVisitor,
} from './expression';
import {
  Block,
  Expression,
  Function,
  If,
  Print,
  Return,
  Stmt,
  StmtVisitor,
  Var,
  While,
} from './stmt';
import { Token } from './token';

export class Resolver implements ExprVisitor<void>, StmtVisitor<void> {
  constructor(
    private readonly interpreter: Interpreter,
    private readonly scopes: Map<string, boolean>[] = [],
  ) {}

  public visitBlockStmt(stmt: Block): void {
    this.beginScope();
    this.resolve(stmt.statements);
    this.endScope();
  }

  public visitFunctionStmt(stmt: Function): void {
    this.declare(stmt.name);
    this.define(stmt.name);
    this.resolveFunction(stmt);
  }

  public visitExpressionStmt(stmt: Expression): void {
    this.resolve(stmt.expression);
  }

  public visitPrintStmt(stmt: Print): void {
    this.resolve(stmt.expression);
  }

  public visitIfStmt(stmt: If): void {
    this.resolve(stmt.condition);
    this.resolve(stmt.thenBranch);
    if (stmt.elseBranch !== null) {
      this.resolve(stmt.elseBranch);
    }
  }

  public visitWhileStmt(stmt: While): void {
    this.resolve(stmt.condition);
    this.resolve(stmt.body);
  }

  public visitVariableStmt(stmt: Var): void {
    this.declare(stmt.name);
    if (stmt.initializer !== null) {
      this.resolve(stmt.initializer);
    }
    this.define(stmt.name);
  }

  public visitReturnStmt(stmt: Return): void {
    if (stmt.value !== null) {
      this.resolve(stmt.value);
    }
  }

  public visitAssignExpr(expr: Assign): void {
    this.resolve(expr.value);
    this.resolveLocal(expr, expr.name);
  }

  public visitCallExpr(expr: Call): void {
    this.resolve(expr.callee);
    for (const arg of expr.args) {
      this.resolve(arg);
    }
  }

  public visitGetExpr(expr: Get): void {
    this.resolve(expr.object);
  }

  public visitSetExpr(expr: Set): void {
    this.resolve(expr.value);
    this.resolve(expr.object);
  }

  public visitThisExpr(expr: This): void {
    this.resolveLocal(expr, expr.keyword);
  }

  public visitSuperExpr(expr: Super): void {
    this.resolveLocal(expr, expr.keyword);
  }

  public visitUnaryExpr(expr: Unary): void {
    this.resolve(expr.right);
  }

  public visitBinaryExpr(expr: Binary): void {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  public visitLiteralExpr(_expr: Literal): void {}

  public visitGroupingExpr(expr: Grouping): void {
    this.resolve(expr.expression);
  }

  public visitLogicalExpr(expr: Logical): void {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  public visitVariableExpr(expr: Variable): void {
    if (
      this.scopes.length !== 0 &&
      this.scopes[this.scopes.length - 1].get(expr.name.lexeme) === false
    ) {
      Lox.error(expr.name, "Can't read local variable in its own initializer.");
    }
    this.resolveLocal(expr, expr.name);
  }

  public visitCommaExpr(expr: Comma): void {
    for (const expression of expr.expressions) {
      this.resolve(expression);
    }
  }

  public visitTernaryExpr(expr: Ternary): void {
    this.resolve(expr.condition);
    this.resolve(expr.thenBranch);
    this.resolve(expr.elseBranch);
  }

  private resolveLocal(expr: Expr, name: Token): void {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }
  }

  private declare(name: Token): void {
    if (this.scopes.length === 0) {
      return;
    }
    const scope = this.scopes[this.scopes.length - 1];
    if (scope.has(name.lexeme)) {
      Lox.error(
        name,
        'Already a variable with this name in this scope.',
      );
    }
    scope.set(name.lexeme, false);
  }

  private define(name: Token): void {
    if (this.scopes.length === 0) {
      return;
    }
    this.scopes[this.scopes.length - 1].set(name.lexeme, true);
  }

  private resolveFunction(func: Function): void {
    this.beginScope();
    for (const param of func.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolve(func.body);
    this.endScope();
  }

  public resolve(node: Stmt[] | Stmt | Expr | null): void {
    if (node === null) {
      return;
    }
    if (Array.isArray(node)) {
      for (const statement of node) {
        this.resolve(statement);
      }
    } else if (node instanceof Stmt) {
      node.accept(this);
    } else {
      node.accept(this);
    }
  }

  private beginScope(): void {
    this.scopes.push(new Map<string, boolean>());
  }

  private endScope(): void {
    this.scopes.pop();
  }
}
