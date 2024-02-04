# glob-copy

[![Node version](https://img.shields.io/npm/v/@kyleupton/glob-copy.svg?style=flat)](https://www.npmjs.com/package/@kyleupton/glob-copy)

Copy utility based on Node.js streams with glob support

# Features
* Glob support
* Progress reporting
* Stream based
* CJS + ESM exports

# Install

```bash
yarn add @kyleupton/glob-copy
```

# Example

```javascript
import { copy } from '@kyleupton/glob-copy'

await copy({
  source: '/Users/kyleupton/Documents',
  destination: '/Volumes/Untitled',
  glob: ['**/*.bin'],
  options: {
    deep: 1
  },
  onProgress: (progress) => { console.log(progress) }
})
```

# Remarks

## Glob

In order to form the list of what files to copy, `glob-copy` uses, well, globs. Spicifically we use a package called [fast-glob](https://www.npmjs.com/package/fast-glob). The input glob can be either a string or an array of strings. We set the current working directory to whatever `source` is, so the glob should be relative to that. If the input glob is left empty, `**/*` is used which will grab everything.

# API Reference

## copy(param)
Returns: `Promise<void>`

### param

Type: `Object`

#### source

Type: `string`

The source directory

#### destination

Type: `string`

Destination directory files get copied to

#### glob (Optional)

Type: `string | string[] | undefined`

Default: `**/*`

Glob representing which files to include

#### options (Optional)

Type: `Object -> fast-glob.Options`

Options that are passed to `fast-glob`

Note: This library will always pass back at least `{ cwd: source, stats: true }`

#### onProgress (Optional)

Type: `function(progress: t_progress) => void`

`t_progress`:

```typescript
{
  percentage: number;
  transferred: number;
  speed: number;
  eta: number;
}
```

The function that get's called on progress

