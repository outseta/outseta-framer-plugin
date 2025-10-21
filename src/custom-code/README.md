# Script Tests

This directory contains comprehensive tests for the `script.ts` module, which handles parsing and creating Outseta JavaScript configuration scripts.

## Test Coverage

The test suite covers both main functions:

### `parseOutsetaScript`

- ✅ Parsing complete scripts with all properties
- ✅ Parsing scripts with only domain
- ✅ Parsing scripts with domain and authCallbackUrl
- ✅ Parsing scripts with domain and postSignupPath
- ✅ Handling different URL formatting (quoted/unquoted)
- ✅ Handling whitespace in URLs
- ✅ Handling different separators (comma, newline)
- ✅ Graceful handling of malformed scripts
- ✅ Edge cases (empty scripts, missing properties)

### `createOutsetaScript`

- ✅ Creating scripts with all properties
- ✅ Creating scripts with only domain
- ✅ Creating scripts with domain and authCallbackUrl
- ✅ Creating scripts with domain and postSignupPath
- ✅ Handling empty/undefined postSignupPath
- ✅ Proper script structure and formatting
- ✅ Including all required Outseta configuration
- ✅ Handling special characters in URLs
- ✅ Conditional comment inclusion
- ✅ Proper URL construction for relative paths

## Running Tests

```bash
# Run tests once
npm run test:run

# Run tests in watch mode
npm test
```

## Test Framework

The tests use [Vitest](https://vitest.dev/) which provides:

- Fast test execution
- TypeScript support out of the box
- Jest-compatible API
- Built-in coverage reporting
