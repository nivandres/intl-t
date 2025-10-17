export type Base = string | number;
export type Key = Base | symbol;
export type Value = Base | null | undefined | boolean | Base[] | Date | Function;
export type Values = Record<Key, Value>;

export type Display<N> = N extends `${infer A}{${string}}${infer B}` ? `${A}${string}${Display<B>}` : N;
export type Content<N> = N extends Base ? Display<N> : N extends { base: infer B } ? Display<B> : Base;

type VFSO<V extends string, C extends string = string, T extends any = Value> = {
  [K in V]: T;
} & VFS1<C>;
type VFSR<S extends string, C extends string> = VFSO<S extends `/${infer V}` | `${infer V} ${string}` ? V : S, C, Function>;
type VFS2<S extends string> = S extends `${infer V},${string}` ? V : S;
type VFS1<S extends string> = S extends `${string}{{${infer V}}}${infer C}`
  ? VFSO<VFS2<V>, C>
  : S extends `${string}{${infer V}}${infer C}`
    ? VFSO<VFS2<V>, C>
    : S extends `${string}<${infer V}>${infer C}`
      ? VFSR<V, C>
      : {};
export type VariablesFromString<S extends string> = VFS1<S>;
export type Override<T, U> = T & U extends never ? Omit<T, keyof U> & U : T & U;
export type VariablesFromNode<N> = "values" extends keyof N ? N["values"] : N extends string ? VariablesFromString<N> : {};
export type Variables<N, V = Values> = Override<V, VariablesFromNode<N>>;
