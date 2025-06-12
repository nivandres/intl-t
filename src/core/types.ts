import type { TranslationNode, invalidKeys } from "./translation";
import type { ReactChunk } from "../types";
import type { Locale } from "../locales/types";
import type { State } from "../state";

export type { TranslationNode, Locale, State };
export type { TranslationProps, ReactNode, TranslationFC, TranslationNodeFC } from "../react/types";

export type Base = string | number;
export type Key = string | number | symbol;
export type Values = Record<Key, Base | null | undefined | boolean | String[] | Date | ReactChunk>;
export type Stringable = string | number | boolean | null | undefined;

export type InvalidKey = (typeof invalidKeys)[number];

export type Node =
  | Base
  | readonly Node[]
  | readonly [Node, ...Node[]]
  | ({
      [key: Key]: Node;
    } & {
      values?: Values;
      base?: Base;
    });

export type Keep<T> = T extends Base
  ? Base
  : T extends [infer F, ...infer R]
  ? readonly [Keep<F>, ...isArray<Keep<R>>]
  :
      | {
          readonly [K in keyof T]: T[K] extends object ? Keep<T[K]> : T[K] | Base;
        }
      | (() => Promisable<Keep<T>>);

export type ResolveNode<T> = T extends infer N extends Node ? N : T extends () => Promisable<infer N extends Node> ? N : never;
export type ResolveTree<T extends Record<string, any>> = {
  [L in keyof T]: ResolveNode<T[L]>;
};

export type PartialTree<N> = {
  [K in Children<N>]?: PartialTree<N[K]>;
} & { children?: string[]; values?: Values; path?: Key[] };

export type Display<N> = N extends `${infer A}{${string}}${infer B}` ? `${A}${string}${Display<B>}` : N;

export type Content<N> = N extends Base ? Display<N> : N extends { base: infer B } ? Display<B> : Base;

export type Children<N> = N extends object
  ? N extends readonly any[] | any[]
    ? Exclude<keyof N, keyof (readonly any[]) | keyof any[]>
    : Exclude<keyof N, InvalidKey>
  : never;

type VFSO<V extends string, C extends string = string, T extends any = Base> = {
  [K in V]: T;
} & VFS1<C>;
type VFSR<S extends string, C extends string> = VFSO<S extends `/${infer V}` | `${infer V} ${string}` ? V : S, C, ReactChunk>;
type VFS2<S extends string> = S extends `${infer V},${string}` ? V : S;
type VFS1<S extends string> = S extends `${string}{{${infer V}}}${infer C}`
  ? VFSO<VFS2<V>, C>
  : S extends `${string}{${infer V}}${infer C}`
  ? VFSO<VFS2<V>, C>
  : S extends `${string}<${infer V}>${infer C}`
  ? VFSR<V, C>
  : {};
export type VariablesFromString<S extends string> = VFS1<S>;

export type Variables<N> = "values" extends keyof N ? N["values"] : N extends string ? VariablesFromString<N> : {};
export type LastKey<R extends Key[]> = R extends [...Key[], infer K] ? K : Key;
export type Join<K extends Key[], S extends string> = K extends [infer F extends Stringable, ...infer R]
  ? R extends [Key, ...Key[]]
    ? `${F}${S}${Join<R, S>}`
    : `${F}`
  : string;

export type Promisable<T> = T | Promise<T>;
export type Awaitable<T> = T & Promise<T>;
export type valueof<O extends object> = O extends Record<any, infer V> ? V : never;

export type ArrayToString<A extends Key[], S extends string = "."> = A extends [infer F extends Stringable, ...infer R]
  ? `${F}${R extends [Key, ...any[]] ? `${S}${ArrayToString<R, S>}` : ""}`
  : "";

export type StringToArray<S extends string, D extends string = "."> = S extends `${infer T}${D}${infer U}`
  ? [T, ...StringToArray<U, D>]
  : [S];

export type isArray<A = any[]> = A extends any[] ? A : never;

export type SearchWays<N, A extends any[] = [], C extends keyof N = Children<N>> = symbol | C extends symbol
  ? A
  : valueof<{
      [K in C]: SearchWays<N[K], [...A, K]> | [...A, K];
    }>;

export type FollowWay<N, W extends Key[]> = W extends [infer F, ...infer R extends Key[]]
  ? F extends keyof N
    ? FollowWay<N[F], R>
    : ArrayToString<W>
  : N;

export type FollowWayWithValues<N, W extends Key[], VV = Values, V = Variables<N> & VV> = W extends [
  infer F extends keyof N,
  ...infer R extends Key[],
]
  ? N[F] extends Node
    ? FollowWayWithValues<N[F], R, V>
    : V
  : V;

export type Translation<
  S extends TranslationSettings = TranslationSettings,
  N = S["tree"][S["allowedLocale"]],
  V = S["variables"],
  L extends S["allowedLocale"] = S["allowedLocale"],
  R extends Key[] = [],
> = {
  <const VV extends Values>(variables?: Partial<V & Variables<N>> | VV): Translation<S, N, V & VV, L, R>;
  <LL extends S["allowedLocale"], const VV extends Values = Values>(
    locale: `${LL}${"" & {}}`,
    variables?: Partial<V & Variables<N>> | VV,
  ): Translation<S, FollowWay<S["tree"][LL], R>, V & VV, LL, R>;
  <D extends ArrayToString<isArray<SearchWays<N>>, S["ps"]> | (string & {}), const VV extends Values = Values>(
    path?: D,
    variables?: Partial<FollowWayWithValues<N, StringToArray<D, S["ps"]>, V & Variables<N>>> & VV,
  ): Translation<
    S,
    FollowWay<N, StringToArray<D, S["ps"]>>,
    FollowWayWithValues<N, StringToArray<D, S["ps"]>, V & Variables<N> & VV>,
    L,
    [...R, ...StringToArray<D, S["ps"]>]
  >;
  <A extends isArray<SearchWays<N>>, A_ extends string[] = A, const VV extends Values = Values>(
    path?: A | A_ | TemplateStringsArray[],
    variables?: Partial<FollowWayWithValues<N, A_, V & Variables<N>>> & VV,
  ): Translation<S, FollowWay<N, A_>, FollowWayWithValues<N, A_, V & Variables<N> & VV>, L, [...R, ...A_]>;
  <A extends isArray<SearchWays<N>>, A_ extends string[] = A, const VV extends Values = Values>(
    ...path: A | A_ | [...(A | A_), (Partial<FollowWayWithValues<N, A_, V>> & Variables<N> & VV)?]
  ): Translation<S, FollowWay<N, A_>, FollowWayWithValues<N, A_, V & Variables<N> & VV>, L, [...R, ...A_]>;
  new <const T extends TranslationData>(data: T): TranslationDataAdapter<T>;
} & TranslationNode<S, N, V & Values, L, R> & {
    [C in Children<N>]: Translation<S, N[C], V & Variables<N>, L, [...R, C]>;
  } & {
    [LL in S["allowedLocale"]]: Translation<S, FollowWay<S["tree"][LL], R>, V, LL, R>;
  } & (N extends any[] | readonly any[] ? Translation<S, N[Children<N>], V & Variables<V>, L, [...R, Children<N>]>[] : Content<N>);

export type { Translation as TranslationType };

export interface TranslationSettings<
  AllowedLocale extends Locale = string,
  MainLocale extends AllowedLocale = AllowedLocale,
  Tree extends Record<string, any> = Record<string, any>,
  Variables extends Values = Values,
  PathSeparator extends string = string,
  N = Node,
> extends State<AllowedLocale> {
  locales: Record<AllowedLocale, Keep<N>> & Partial<Tree>;
  mainLocale: MainLocale;
  defaultLocale: MainLocale;
  currentLocale: AllowedLocale;
  allowedLocales: AllowedLocale[] | [MainLocale, ...AllowedLocale[]];
  allowedLocale: AllowedLocale;
  pathSeparator: PathSeparator;
  variables: Variables;
  tree: ResolveTree<Tree>;
  ps: PathSeparator;
  settings: this;
  preventDynamic: boolean;
  setLocale?: (locale: Locale) => Locale | void;
  getLocale?: (locale: Locale) => Promisable<Node>;
}

export interface TranslationData<
  S extends TranslationSettings = TranslationSettings,
  N = S["tree"],
  V = S["variables"],
  L extends S["allowedLocale"] = S["mainLocale"],
  R extends Key[] = Key[],
> {
  settings: S;
  node?: N;
  variables?: V;
  locale?: L;
  path?: R;
  key?: LastKey<R>;
  parent?: TranslationNode;
}

export type TranslationDataAdapter<T extends TranslationData = TranslationData> = Translation<
  undefined extends T["settings"] ? TranslationSettings : T["settings"],
  undefined extends T["node"] ? T["settings"]["tree"] : T["node"],
  undefined extends T["variables"] ? NonNullable<T["settings"]["variables"]> : NonNullable<T["variables"]>,
  undefined extends T["locale"] ? NonNullable<T["settings"]["mainLocale"]> : NonNullable<T["locale"]>
>;
