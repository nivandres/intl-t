import { Locale } from "./locales";
import type { ReactChunk } from "./react";
import { State } from "./state";
import { format } from "./tools";

export * from "./locales";

export const invalidKeys = ["base", "values", "__children__", "__path__", "__source__", "default"] as const;
export type InvalidKey = (typeof invalidKeys)[number] | `__${string}`;

export type Base = string | number;
export type Key = string | number | symbol;
export type Values = Record<string, Base | null | undefined | boolean | String[] | Date | ReactChunk>;

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
  ? readonly [Keep<F>, ...Keep<R>]
  : {
      readonly [K in keyof T]: T[K] extends object ? Keep<T[K]> : T[K];
    };

export type PNode<N extends Node = Node> = N extends object
  ? N extends any[]
    ? {
        children: Exclude<keyof N, keyof any[]>;
        values: Values;
      }
    : {
        children: Exclude<keyof N, InvalidKey>;
        values: "values" extends keyof N ? N["values"] : Values;
      }
  : N extends string
  ? { children: never; values: Values }
  : never;

export type Promisable<T> = T & Promise<T>;
export type valueof<O extends object> = O extends Record<any, infer V> ? V : never;
export type Remove<T, U> = T extends U & infer R ? R : T;

export type ArrayToString<A extends Key[], S extends string = "."> = A extends [infer F, ...infer R]
  ? F extends Base
    ? `${F}${R extends [Base, ...any[]] ? `${S}${ArrayToString<R, S>}` : ""}`
    : ""
  : "";

export type StringToArray<S extends string, D extends string = "."> = S extends `${infer T}${D}${infer U}`
  ? [T, ...StringToArray<U, D>]
  : [S];

export type isArray<A extends any> = A extends any[] ? A : never;

export type SearchWays<
  N extends Node,
  A extends any[] = [],
  P extends PNode<N> = PNode<N>,
> = P["children"] extends never
  ? A
  : valueof<{
      [K in P["children"]]: K extends keyof N
        ? N[K] extends Node
          ? SearchWays<N[K], A extends [...infer F] ? [...F, K] : [K]> | A
          : never
        : never;
    }>;

export type FollowWay<N extends Node, W extends string[]> = W extends [infer F, ...infer R]
  ? F extends keyof N
    ? N[F] extends Node
      ? R extends string[]
        ? FollowWay<N[F], R>
        : N
      : N
    : N
  : N;

export type FollowWayWithValues<
  N extends Node,
  W extends string[],
  VV extends Values = Values,
  V extends Values = PNode<N>["values"] & VV,
> = W extends [infer F, ...infer R]
  ? F extends keyof N
    ? N[F] extends Node
      ? R extends string[]
        ? FollowWayWithValues<N[F], R, V>
        : V
      : V
    : V
  : V;

export interface TranslationProps<
  S extends TranslationSettings,
  N extends Node,
  V extends Values,
  L extends string,
  R extends Key[],
  L_ extends string,
  A_ extends string[],
  D_ extends string,
  A extends string[] = isArray<SearchWays<N>>,
  D extends string = ArrayToString<A, S["ps"]>,
> extends Partial<State<L | L_>> {
  children?: any;
  t?: TranslationNode<S, N, V, L, any, R>;
  path?: D | D_ | A | A_;
  variables?: Partial<FollowWayWithValues<N, A, V>> & Values;
  locale?: L | L_;
  lang?: L | L_;
  isolatedLocale?: L | boolean;
  source?: Node;
  sourcePath?: D | D_ | (D | D_)[];
  deep?: number;
  sourceDefault?: boolean;
  preventDynamic?: boolean;
  localeFallback?: L | L_;
  setLang?: (lang: L | L_) => void;
  onLangChange?: (lang: L | L_) => void;
  settings?: Partial<S>;
}

export type TranslationNode<
  S extends TranslationSettings = TranslationSettings,
  N extends Node = S["tree"],
  V extends Values = S["variables"],
  L extends S["allowedLocale"] = S["mainLocale"],
  P extends any = null,
  R extends Key[] = [],
  I extends Key = R extends [...Key[], infer F] ? F : Key,
  C extends keyof N & Key = Exclude<keyof N, InvalidKey | keyof any[]> & Key,
  UF extends Function = {
    <VV extends Values>(variables?: Partial<V> & VV & Values): TranslationNode<S, N, V & VV, L, P, R, I>;
  },
  SF extends Function = {
    <VV extends Values>(variables?: Partial<V> & VV): Promisable<TranslationNode<S, N, V & VV, L, P, R, I>>;
    <
      D_ extends string,
      A_ extends string[],
      A extends isArray<SearchWays<N>>,
      D extends ArrayToString<A, S["ps"]>,
      VV extends Values,
    >(
      path?: D_ | D | A | A_ | TemplateStringsArray,
      variables?: Partial<FollowWayWithValues<N, A, S["variables"]>> & VV,
    ): Promisable<
      TranslationNode<
        S,
        FollowWay<N, StringToArray<D, S["ps"]>>,
        FollowWayWithValues<N, A, V & VV>,
        L,
        any,
        [...R, ...A]
      >
    >;
    <D_ extends string[], D extends isArray<SearchWays<N>>, VV extends Values>(
      ...params: [...(D | D_), (Partial<FollowWayWithValues<N, D, S["variables"]>> & VV)?]
    ): Promisable<TranslationNode<S, FollowWay<N, D>, FollowWayWithValues<N, D, V & VV>, L, any, [...R, ...D]>>;
    <D_ extends string[], D extends isArray<SearchWays<N>>>(...params: [...(D | D_)]): Promisable<
      TranslationNode<S, FollowWay<N, D>, FollowWayWithValues<N, D, V>, L, any, [...R, ...D]>
    >;
  },
  RF extends Function = <L_ extends string, A_ extends string[], D_ extends string>(
    props: TranslationProps<S, N, V, L, R, L_, A_, D_>,
  ) => any,
> = {
  g: Translation<S>[L];
  global: Translation<S>[L];
  t: TranslationNode<S, N, V, L, P, R, I>;
  tr: TranslationNode<S, N, V, L, P, R, I>;
  parent: P extends null ? Translation<S> : P;
  p: P extends null ? Translation<S> : P;
  values: V;
  lang: L;
  dir: "ltr" | "rtl";
  path: R;
  key: I;
  id: ArrayToString<R, S["ps"]>;
  node: N;
  settings: S;
  locales: S["allowedLocales"];
  locale: S["allowedLocale"];
  mainLocale: S["mainLocale"];
  main: S["mainLocale"];
  get: SF;
  use: UF;
  useTranslation: SF;
  getTranslation: SF;
  Tr: RF;
  Translation: RF;
  format: typeof format;
  setLocale(lang: L): void;
  addChild(child: C | string, src: Node): void;
  addSource(src: N): void;
  getSource(deep?: number): N;
  getLocale(): L;
  useLocale(
    defaultLocale?: L,
    ...args: any[]
  ): [L, (locale: L) => void] & L & { locale: L; setLocale: (lang: L) => void };
  src: N;
} & {
  [Locale in S["allowedLocale"]]: TranslationNode<S, N, V, Locale, P, R, I>;
} & (N extends Base
    ? N & {
        base: N;
        raw: string;
        children?: [];
        child?: never;
        type: "base";
      }
    : SF & {
        search: SF;
        children: C[];
        child: C;
        index: I;
        keys: Key[];
      } & (N extends readonly Node[]
          ? {
              base?: undefined;
              index: I;
              keys: Key[];
              type: "list";
            } & {
              [K in C]: N[K] extends Node
                ? TranslationNode<S, N[K], V, L, TranslationNode<S, N, V, L, P, R, I>, [...R, K], K>
                : never;
            }
          : N extends Record<string, unknown>
          ? {
              base: N["base"];
              raw: N["base"];
              values: V & N["values"];
              type: "tree";
            } & {
              [K in C]: N[K] extends Node
                ? TranslationNode<S, N[K], V & N["values"], L, TranslationNode<S, N, V, L, P, R, I>, [...R, K], K>
                : never;
            }
          : never));

export type Translation<S extends TranslationSettings = TranslationSettings> = TranslationNode<S>;

export type TranslationPlugin<N = unknown, X = unknown> = (node: N) => X;

export interface TranslationSettings<
  AllowedLocale extends Locale = Locale,
  MainLocale extends AllowedLocale = AllowedLocale,
  Tree extends Node = Node,
  Variables extends Values = Values,
  PathSeparator extends string = string,
> extends State<AllowedLocale> {
  locales:
    | {
        [Locale in AllowedLocale]: Keep<Tree>;
      }
    | AllowedLocale[];
  mainLocale: MainLocale;
  defaultLocale: MainLocale;
  currentLocale: AllowedLocale;
  tree: Tree;
  allowedLocales: AllowedLocale[];
  allowedLocale: AllowedLocale;
  plugins?: TranslationPlugin[];
  variables: Variables;
  hidratation?: boolean;
  fullHidratation?: boolean;
  format: typeof format;
  origin: Record<AllowedLocale, object>;
  settings: TranslationSettings;
  preventDynamic?: boolean;
  injectVariables(text: string, variables: Values, state?: State): any;
  getSource(locale: AllowedLocale): Promise<Tree> | Tree;
  getLocale(locale: AllowedLocale): Promise<Tree> | Tree;
  setLang(lang: AllowedLocale): void;
  matchLocale(requestLocales: string[] | string): AllowedLocale;
  ps: PathSeparator;
}
