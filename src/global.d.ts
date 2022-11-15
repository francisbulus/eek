declare module 'hunterio'

declare module '*.js' {
  const value: any
  export default value
}

type NullablePartial<T> = { [U in keyof T]?: T[U] | null }
type With<T, K extends keyof T> = Required<Pick<T, K>> & Exclude<T, K>
type Without<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type Diff<T, U> = T extends U ? never : T // Remove types from T that are assignable to U
type Optional<TBase, TOptionals extends keyof TBase> = Without<TBase, TOptionals> &
  Partial<Pick<TBase, TOptionals>>

// source: https://dev.to/aexol/typescript-tutorial-infer-keyword-2cn
// See also: https://stackoverflow.com/questions/60067100/why-is-the-infer-keyword-needed-in-typescript
// Replace with `awaited` in Typescript 4.0
type Unpromisify<T> = T extends Promise<infer R> ? R : never
type UnpromisifyFn<T> = T extends (...args: any) => Promise<infer R> ? R : never
