import { Locale } from "./locales";
import type { ReactChunk } from "./react";

export const invalidKeys = ["base", "values", "children", "default"] as const;
export type InvalidKey = (typeof invalidKeys)[number] | `__${string}`;

export type Base = string | number;
export type Key = string | number;
export type Values = Record<string, Base | null | undefined | boolean | Date | ReactChunk>;

export type Node =
  | Base
  | readonly Node[]
  | readonly [Node, ...Node[]]
  | ({
      [key: Key]: Node;
    } & {
      values?: Values;
      base?: Base;
      children?: Key[];
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
  P extends PNode<N> = PNode<N>
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
  V extends Values = PNode<N>["values"] & VV
> = W extends [infer F, ...infer R]
  ? F extends keyof N
    ? N[F] extends Node
      ? R extends string[]
        ? FollowWayWithValues<N[F], R, V>
        : V
      : V
    : V
  : V;

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
    <VV extends Values>(variables?: Partial<V> & VV): Remove<TranslationNode<S, N, V & VV, L, P, R, I>, Function>;
  },
  SF extends Function = {
    <VV extends Values>(variables?: Partial<V> & VV): TranslationNode<S, N, V & VV, L, P, R, I>;
    <
      D_ extends string,
      A_ extends string[],
      A extends isArray<SearchWays<N>>,
      D extends ArrayToString<A, S["ps"]>,
      VV extends Values
    >(
      path?: D_ | D | A | A_,
      variables?: Partial<FollowWayWithValues<N, A, S["variables"]>> & VV
    ): TranslationNode<
      S,
      FollowWay<N, StringToArray<D, S["ps"]>>,
      FollowWayWithValues<N, A, V & VV>,
      L,
      any,
      [...R, ...A]
    >;
    <D_ extends string[], D extends isArray<SearchWays<N>>, VV extends Values>(
      ...params: [...(D | D_), (Partial<FollowWayWithValues<N, D, S["variables"]>> & VV)?]
    ): TranslationNode<S, FollowWay<N, D>, FollowWayWithValues<N, D, V & VV>, L, any, [...R, ...D]>;
    <D_ extends string[], D extends isArray<SearchWays<N>>>(...params: [...(D | D_)]): TranslationNode<
      S,
      FollowWay<N, D>,
      FollowWayWithValues<N, D, V>,
      L,
      any,
      [...R, ...D]
    >;
  },
  RF extends Function = {
    <A extends isArray<SearchWays<N>>, D extends ArrayToString<A, S["ps"]>, VV extends Values>(props: {
      path?: D | A;
      variables?: Partial<FollowWayWithValues<N, A>> & VV;
      source?: Node;
      children?: any;
      t?: TranslationNode<S, N, V, L, P, R, I>;
    }): any;
  }
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
  with: <T extends TranslationNode<S, N, V, L, P, R, I>, X>(plugin: TranslationPlugin<T, X>, traverse?: boolean) => X;
  useTranslation: SF;
  T: RF;
  Translation: RF;
  setLang: (lang: S["allowedLocale"]) => void;
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

export type Complex = "complex";
export type Simple = "simple";
export type Complexity = Complex | Simple;

export interface TranslationCallbacks {
  onNodeLoad?: (node: TranslationNode) => void;
  onUse?: (node: TranslationNode) => void;
  onGet?: (node: TranslationNode) => void;
  onNodePluginLoad?: (node: TranslationNode, plugin: TranslationPlugin) => void;
  onError?: (error: unknown) => void;
  onTranslationNotFound?: (node: TranslationNode) => void;
}

export interface TranslationSettings<
  AllowedLocale extends Locale = Locale,
  MainLocale extends AllowedLocale = AllowedLocale,
  Tree extends Node = Node,
  Variables extends Values = Values,
  PathSeparator extends string = string,
  TypeComplexity extends Complexity = Complexity
> {
  locales: {
    [Locale in AllowedLocale]: Keep<Tree>;
  };
  mainLocale: MainLocale;
  defaultLocale: MainLocale;
  tree: Tree;
  allowedLocales: AllowedLocale[];
  allowedLocale: AllowedLocale;
  plugins?: TranslationPlugin[];
  variables: Variables;
  typeComplexity: TypeComplexity;
  injectVariables: (text: string, variables: Values) => unknown;
  callbacks: TranslationCallbacks;
  ps: PathSeparator;
}
