import * as fs from 'fs';
import * as readline from 'readline';
import { Scanner } from './scanner';
import { Token } from './token';

export class Lox {
  private static hadError = false;

  public static main(args: string[]): void {
    if (args.length > 1) {
      console.log("Usage: tslox [script]");
      process.exit(64);  // following unix convention sysexit code
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
    } catch (e) {
      console.error(`Error reading file: ${path}`);
      process.exit(66);
    }
  }

  private static runPrompt(): void {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '> '
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

    for (const token of tokens) {
      console.log(token.toString());
    }

  }

  static error(line: number, message: string): void {
    this.report(line, "", message);
  }

  static report(line: number, where: string, message: string): void {
    console.error(`[line ${line}] Error${where}: ${message}`);
    this.hadError = true;
  }
}

Lox.main(process.argv.slice(2));