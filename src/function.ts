import { Callable } from './callable';
import { Environment } from './environment';
import { Interpreter } from './interpreter';
import { Function } from './stmt';
import { Return as ReturnSignal } from './return';

export class LoxFunction implements Callable {
  constructor(
    private readonly declaration: Function,
    private readonly closure: Environment,
  ) {}

  call(interpreter: Interpreter, args: Object[]): Object {
    const environment = new Environment(this.closure);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }
    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (returnValue) {
      if (returnValue instanceof ReturnSignal) {
        return returnValue.value;
      }
      throw returnValue;
    }

    return null;
  }

  arity(): number {
    return this.declaration.params.length;
  }

  toString(): string {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}
