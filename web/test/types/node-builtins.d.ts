declare module 'fs' {
  export function readFileSync(path: string | URL, encoding: string): string
  export function mkdtempSync(prefix: string): string
  export function mkdirSync(path: string): void
  export function readdirSync(path: string): string[]
  export function rmSync(path: string, options?: { force?: boolean; recursive?: boolean }): void
  export function statSync(path: string): { isDirectory(): boolean }
  export function writeFileSync(path: string, data: string): void
}

declare module 'os' {
  export function tmpdir(): string
}

declare module 'path' {
  export const sep: string
  export function join(...paths: string[]): string
  export function relative(from: string, to: string): string
  export function resolve(...paths: string[]): string
}
