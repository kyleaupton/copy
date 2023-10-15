import { createReadStream, createWriteStream } from 'fs'
import fs from 'fs/promises'
import path from 'path'
import fb, { type Options, type Entry } from 'fast-glob'
import progressStream from 'progress-stream'

interface t_progress {
  percentage: number
  transferred: number
  speed: number
  eta: number
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
  options.cwd = source
  options.stats = true

  // @ts-ignore
  const files = await fb(glob ?? '**/*', options) as Entry[]
  const totalSize = files.reduce((accumulator, curr) => accumulator + (curr.stats?.size ?? 0), 0)
  let transferred = 0
  let incrementalTransferred = 0
  let speed = 0

  // Setup onProgress handler
  let interval: ReturnType<typeof setInterval> | undefined
  if (onProgress) {
    interval = setInterval(() => {
      const totalTransferred = transferred + incrementalTransferred
      const remaining = totalSize - totalTransferred

      onProgress({
        percentage: (totalTransferred / totalSize) * 100,
        transferred: totalTransferred,
        speed,
        eta: remaining / speed
      })
    }, 500)
  }

  const copyFile = async (file: Entry): Promise<void> => {
    const fileRelPath = file.path
    const srcAbsPath = path.join(source, fileRelPath)
    const destAbsPath = path.join(destination, fileRelPath)
    const destDirname = path.dirname(destAbsPath)

    // Ensure destination directory
    await fs.mkdir(destDirname, { recursive: true })

    // Do the copy
    await new Promise<void>((resolve) => {
      const progress = progressStream({ time: 500 })

      progress.on('progress', (progress) => {
        incrementalTransferred = progress.transferred
        speed = progress.speed
      })

      createReadStream(srcAbsPath)
        .pipe(progress)
        .pipe(
          createWriteStream(destAbsPath)
            .on('finish', () => {
              transferred += file.stats?.size ?? 0
              incrementalTransferred = 0
              resolve()
            })
        )
    })
  }

  for (const file of files) {
    await copyFile(file)
  }

  if (interval) {
    clearInterval(interval)
  }
}
