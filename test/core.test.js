import test from 'node:test';
import assert from 'node:assert/strict';
import { parseStackFrame, StackFrame } from '../src/index.js';

test('parses a named frame with file, line, and column', () => {
  const frame = parseStackFrame('    at foo (/app/index.js:1:2)');
  assert.deepEqual(frame, {
    file: '/app/index.js',
    line: 1,
    column: 2,
    functionName: 'foo',
  });
});

test('parses an anonymous frame with file, line, and column', () => {
  const frame = parseStackFrame('    at /app/index.js:10:20');
  assert.deepEqual(frame, {
    file: '/app/index.js',
    line: 10,
    column: 20,
    functionName: null,
  });
});

test('parses a native frame', () => {
  const frame = parseStackFrame('    at foo (native)');
  assert.deepEqual(frame, {
    file: null,
    line: null,
    column: null,
    functionName: 'foo',
  });
});

test('parses a bare native frame', () => {
  const frame = parseStackFrame('    at native');
  assert.deepEqual(frame, {
    file: null,
    line: null,
    column: null,
    functionName: null,
  });
});

test('parses a frame without a leading at', () => {
  const frame = parseStackFrame('/app/index.js:3:4');
  assert.deepEqual(frame, {
    file: '/app/index.js',
    line: 3,
    column: 4,
    functionName: null,
  });
});

test('parses a frame with a function name containing spaces', () => {
  const frame = parseStackFrame('    at Object.<anonymous> (/app/index.js:5:6)');
  assert.deepEqual(frame, {
    file: '/app/index.js',
    line: 5,
    column: 6,
    functionName: 'Object.<anonymous>',
  });
});

test('parses a frame with a Windows-style path', () => {
  const frame = parseStackFrame('    at foo (C:\\app\\index.js:7:8)');
  assert.deepEqual(frame, {
    file: 'C:\\app\\index.js',
    line: 7,
    column: 8,
    functionName: 'foo',
  });
});

test('parses a frame with a URL location', () => {
  const frame = parseStackFrame('    at foo (https://example.test/app.js:9:10)');
  assert.deepEqual(frame, {
    file: 'https://example.test/app.js',
    line: 9,
    column: 10,
    functionName: 'foo',
  });
});

test('parses a frame with eval location containing parentheses', () => {
  const frame = parseStackFrame('    at eval (eval at <anonymous> (/app/index.js:11:12), <anonymous>:1:1)');
  assert.deepEqual(frame, {
    file: 'eval at <anonymous> (/app/index.js:11:12), <anonymous>',
    line: 1,
    column: 1,
    functionName: 'eval',
  });
});

test('returns nulls for an unrecognized frame shape', () => {
  const frame = parseStackFrame('    at something unexpected');
  assert.deepEqual(frame, {
    file: null,
    line: null,
    column: null,
    functionName: null,
  });
});

test('throws when given a non-string', () => {
  assert.throws(() => parseStackFrame(42), TypeError);
  assert.throws(() => parseStackFrame(null), TypeError);
  assert.throws(() => parseStackFrame(undefined), TypeError);
});

test('StackFrame.parse returns a StackFrame instance', () => {
  const frame = StackFrame.parse('    at foo (/app/index.js:1:2)');
  assert.ok(frame instanceof StackFrame);
  assert.equal(frame.file, '/app/index.js');
  assert.equal(frame.line, 1);
  assert.equal(frame.column, 2);
  assert.equal(frame.functionName, 'foo');
});
