# tslox

A TypeScript implementation of the Lox programming language tree-walk interpreter from [Crafting Interpreters](https://craftinginterpreters.com/) by Robert Nystrom.

## Current Implementation Status

### Implemented Features

- **Lexical Analysis (Scanner)**

  - Tokenization of Lox source code
  - Support for all Lox token types
  - Line number tracking for error reporting

- **Parsing**

  - Recursive descent parser
  - Expression parsing with proper precedence
  - Support for:
    - Binary expressions (`+`, `-`, `*`, `/`, `>`, `>=`, `<`, `<=`, `==`, `!=`)
    - Unary expressions (`-`, `!`)
    - Grouping with parentheses
    - Literals (numbers, strings, booleans, nil)

- **Runtime Interpreter**

  - Expression evaluation
  - Arithmetic operations
  - String concatenation
  - Comparison operators
  - Truthiness semantics (nil and 0 are falsy)
  - Runtime error handling

- **REPL & File Execution**
  - Interactive REPL mode
  - Script file execution

### Planned Features

- [ ] Variable declarations and assignments
- [ ] Statements
- [ ] Control flow (if/else, while, for)
- [ ] Functions and closures
- [ ] Classes and inheritance
- [ ] Logical operators (`and`, `or`)
- [ ] Ternary and comma operators

## Prerequisites

- Node.js (v22.20.0 or higher)
- pnpm (v10.15.1 or compatible)

## Installation

```bash
pnpm install
```

## Building

```bash
pnpm build
```

## Usage

### Running the REPL

```bash
pnpm start
```

This starts an interactive prompt where you can enter Lox expressions:

```
> 2 + 3 * 4
14
> "Hello, " + "World!"
Hello, World!
> !(5 - 4 > 3 * 2 == !nil)
true
>
```

### Running a Script File

```bash
pnpm start path/to/script.lox
```

## Project Structure

```
tslox/
├── src/
│   ├── expression.ts      # AST node definitions
│   ├── interpreter.ts     # Tree-walk interpreter & expression evaluator
│   ├── lox.ts            # Main entry point
│   ├── parser.ts         # Recursive descent parser
│   ├── printer.ts        # AST pretty-printer
│   ├── runtimeerror.ts   # Runtime error handling
│   ├── scanner.ts        # Lexical analyzer/tokenizer
│   ├── token-type.ts     # Token type enumeration
│   └── token.ts          # Token class definition
├── package.json
├── tsconfig.json
└── README.md
```

## Resources

- [Crafting Interpreters Book](https://craftinginterpreters.com/)
- [Lox Language Specification](https://craftinginterpreters.com/the-lox-language.html)
