import * as fs from 'fs';
import * as readline from 'readline';
import { Scanner } from './scanner';
import { Token } from './token';
import { TokenType } from './token-type';
import { Parser } from './parser';
import { Expr } from './expression';
import { AstPrinter } from './printer';
import { RuntimeError } from './runtimeerror';
import { Interpreter } from './interpreter';

export class Lox {
  private static readonly interpreter = new Interpreter();
  private static hadError = false;
  private static hadRuntimeError = false;

  public static main(args: string[]): void {
    if (args.length > 1) {
      console.log('Usage: tslox [script]');
      process.exit(64); // following unix convention sysexit code
    } else if (args.length === 1) {
      this.runFile(args[0]);
    } else {
      this.runPrompt();
    }
  }

  private static runFile(path: string): void {
    try {
      const source = fs.readFileSync(path, 'utf-8');
      this.run(source);
      if (this.hadError) {
        process.exit(65);
      }
      if (this.hadRuntimeError) {
        process.exit(70);
      }
    } catch (e) {
      console.error(`Error reading file: ${path}`);
      process.exit(66);
    }
  }

  private static runPrompt(): void {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '> ',
    });

    rl.prompt();

    rl.on('line', (line) => {
      this.run(line);
      this.hadError = false;
      rl.prompt();
    });

    rl.on('close', () => {
      console.log('\nGoodbye!');
      process.exit(0);
    });
  }

  private static run(source: string): void {
    const scanner = new Scanner(source);
    const tokens: Token[] = scanner.scanTokens();
    const parser = new Parser(tokens);
    const expr: Expr = parser.parse();
    if (this.hadError) return;
    this.interpreter.interpret(expr);
  }

  static error(tokenOrLine: Token | number, message: string): void {
    if (typeof tokenOrLine === 'number') {
      this.report(tokenOrLine, '', message);
    } else {
      if (tokenOrLine.type === TokenType.EOF) {
        this.report(tokenOrLine.line, ' at end', message);
      } else {
        this.report(tokenOrLine.line, ` at '${tokenOrLine.lexeme}'`, message);
      }
    }
  }

  static runtimeError(error: RuntimeError): void {
    console.error(error.message + '\n[line ' + error.token.line + ']');
    this.hadRuntimeError = true;
  }

  static report(line: number, where: string, message: string): void {
    console.error(`[line ${line}] Error${where}: ${message}`);
    this.hadError = true;
  }
}

Lox.main(process.argv.slice(2));
