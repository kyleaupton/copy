import { createReadStream, createWriteStream } from 'fs'
import fs from 'fs/promises'
import { Transform } from 'stream'
import { pipeline } from 'stream/promises'
import path from 'path'
import fb, { type Options, type Entry } from 'fast-glob'

interface t_progress {
  percentage: number
  transferred: number
  speed: number
  eta: number
  prettyEta: string
}

export const copy = async ({
  source,
  destination,
  glob,
  options,
  onProgress
}: {
  source: string
  destination: string
  glob?: string | string[]
  options?: Options
  onProgress?: (progress: t_progress) => void // eslint-disable-line
}): Promise<void> => {
  // Ensure source and destination dirs
  // Source must exist AND be a dir, destination
  // must be a dir if it exists. Otherwise
  // we'll make it below, guaranteeing it's a dir
  await ensureDir(source)
  await ensureDir(destination, { mustExist: false })

  // Ensure destination dir
  await fs.mkdir(destination, { recursive: true })

  if (!options) options = {}

  const files = await fb(glob ?? '**/*', { ...options, cwd: source, stats: true })
  const totalSize = files.reduce((accumulator, curr) => accumulator + (curr.stats?.size ?? 0), 0)
  const start = Date.now()
  let runningSize = 0

  let id: NodeJS.Timeout | undefined
  if (onProgress) {
    id = setInterval(() => {
      const percentage = (runningSize / totalSize) * 100
      const transferred = runningSize
      const speed = runningSize / ((Date.now() - start) / 1000)
      const eta = (totalSize - runningSize) / speed
      const prettyEta = humanReadableEta(eta)

      onProgress({ percentage, transferred, speed, eta, prettyEta })
    }, 1000)
  }

  const copyFile = async (file: Entry): Promise<void> => {
    const src = path.join(source, file.path)
    const dest = path.join(destination, file.path)

    // Ensure destination directory
    await fs.mkdir(path.dirname(dest), { recursive: true })

    // Create streams
    const read = createReadStream(src)
    const write = createWriteStream(dest)

    // Do the copy
    await pipeline(
      read,
      new Transform({
        transform (chunk, encoding, callback) {
          runningSize += chunk.length
          this.push(chunk)
          callback()
        }
      }),
      write
    )
  }

  for (const file of files) {
    await copyFile(file)
  }

  if (id) {
    clearInterval(id)
  }
}

const ensureDir = async (dir: string, { mustExist = true }: { mustExist?: boolean } = {}): Promise<void> => {
  try {
    const stats = await fs.stat(dir)

    if (stats.isFile()) {
      throw Error(`${dir} is not a directory`)
    }
  } catch (e) {
    if (mustExist) {
      throw Error(`${dir} does not exist`)
    }
  }
}

const humanReadableEta = (eta: number): string => {
  const h = Math.floor(eta / 3600)
    .toString()
    .padStart(2, '0')

  const m = Math.floor((eta % 3600) / 60)
    .toString()
    .padStart(2, '0')

  const s = Math.floor(eta % 60)
    .toString()
    .padStart(2, '0')

  return h !== '00' ? `${h}:${m}:${s}` : `${m}:${s}`
}
