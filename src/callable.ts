import { Interpreter } from './interpreter';

export interface Callable {
    call(interpreter: Interpreter, args: Object[]): Object;
    arity(): number;
    toString(): string;
}