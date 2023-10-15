import { copy } from '../src/index.js'

await copy({
  source: '/Volumes/CCCOMA_X64FRE_EN-US_DV9',
  destination: '/Users/kyleupton/Documents/dest/iso',
  glob: ['**/*'],
  options: {
    ignore: ['sources/install.wim']
  },
  onProgress: (progress) => { console.log(progress) }
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
