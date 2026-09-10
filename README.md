# tslox

`tslox` is a tree-walk interpreter for the Lox language, written in TypeScript. It follows [Crafting Interpreters](https://craftinginterpreters.com/).

## What works

- Numbers, strings, booleans, and `nil`
- Arithmetic, comparisons, equality, and unary operators
- Variables and assignment
- Blocks and variable scope
- Ternary expressions
- `print` statements
- Interactive REPL and script files
- Parser and runtime error reporting

In this interpreter, `nil`, `false`, and `0` are treated as false. Other values are true.

## Install

```bash
pnpm install
```

## Run the interpreter

Build the project first:

```bash
pnpm build
```

Start the REPL:

```bash
pnpm start
```

The REPL accepts both expressions and statements:

```text
> 2 + 3 * 4
14
> var x = 10;
> x = x + 2
12
> print x;
12
```

Run a Lox script:

```bash
pnpm start test/scope.lox
```

## Run the tests

Run all script and REPL tests with one command:

```bash
pnpm test
```

The script examples are in the `test/` directory.

## Project layout

```text
src/       Interpreter source code
test/      Lox script test cases
scripts/   Test runners
```

## Resources

- [Crafting Interpreters](https://craftinginterpreters.com/)
- [The Lox Language](https://craftinginterpreters.com/the-lox-language.html)
