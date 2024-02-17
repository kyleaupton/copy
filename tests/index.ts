import { copy } from '../src/index.js'

const log = (s: string): void => {
  process.stdout.clearLine(0)
  process.stdout.cursorTo(0)
  process.stdout.write(s)
}

await copy({
  source: '/Volumes/CCCOMA_X64FRE_EN-US_DV9',
  destination: '/Volumes/WIN11',
  glob: ['**/*'],
  options: {
    ignore: ['sources/install.wim', 'sources/boot.iso']
  },
  onProgress: (progress) => {
    console.log(`Percent: ${Math.floor(progress.percentage)}\tETA: ${progress.prettyEta}\tBytes: ${progress.transferred}\tSpeed: ${progress.speed}`)
  }
})

// await copy({
//   source: '/Users/kyleupton/Documents',
//   destination: '/Volumes/Untitled',
//   glob: ['**/*.bin'],
//   options: {
//     deep: 1
//   },
//   onProgress: (progress) => { console.log(progress) }
// })
