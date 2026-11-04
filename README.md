# mini-stack-frame

Parses a single V8 stack frame line into its file, line number, column number, and function name fields.

```js
import { parseStackFrame, StackFrame } from 'mini-stack-frame';

const frame = parseStackFrame('    at foo (/app/index.js:1:2)');
// { file: '/app/index.js', line: 1, column: 2, functionName: 'foo' }

const same = StackFrame.parse('    at /app/index.js:10:20');
// StackFrame { file: '/app/index.js', line: 10, column: 20, functionName: null }
```

## Why this exists

Stack traces are strings, and the interesting part is usually one frame. Extracting fields by hand means writing the same regular expression in every project, and that expression tends to grow until it handles every shape V8 can emit. This library fixes the shape of the result instead: a plain object with four keys, or a `StackFrame` instance with the same fields.

The trade-off is that unknown frame shapes are not guessed at. If the location is neither `native` nor a `file:line:column` triple, the file, line, and column come back as `null` rather than being partially recovered. That keeps the output predictable and lets callers decide what to do with a frame the parser does not recognize.

## The awkward edge

V8 sometimes emits frames with no function name, and sometimes emits `native` frames where there is no file at all. Both are handled: the function name is `null` when absent, and `native` frames return `null` for file, line, and column. A frame whose location contains parentheses (such as an `eval` frame) is parsed by taking the outermost parentheses, so the file field keeps the inner text intact.

## API

### `parseStackFrame(frame)`

Returns `{ file, line, column, functionName }`. `file` and `functionName` are strings or `null`; `line` and `column` are numbers or `null`. Throws a `TypeError` if `frame` is not a string.

### `StackFrame.parse(frame)`

Same parsing, but returns a `StackFrame` instance. The constructor is `new StackFrame(file, line, column, functionName)`.
