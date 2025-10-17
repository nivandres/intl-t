import type {
  ArrayToString,
  Base,
  Children,
  Content,
  FollowWayWithValues,
  isArray,
  Node,
  SearchWays,
  State,
  TranslationSettings,
  TranslationType,
  Values,
} from "@intl-t/core/types";
import type { ReactNode, Key as ReactKey, Dispatch, SetStateAction } from "react";

// export * from "@intl-t/react/types";

export type { ReactNode, ReactKey };

export type ReactSetState<T> = Dispatch<SetStateAction<T>>;
export type ReactState<T> = [T, ReactSetState<T>];

export interface ChunkProps {
  children: ReactNode;
  tagName: string;
  tagAttributes: string;
  tagContent: string;
  value?: Base | null;
  key: ReactKey;
  [key: string]: any;
}

export type Chunk = (props: ChunkProps) => ReactNode | void;

export interface TranslationProps<
  S extends TranslationSettings = TranslationSettings,
  N = Node,
  V = Values,
  A extends string[] = isArray<SearchWays<N>>,
  D extends string = ArrayToString<A, S["ps"]>,
> extends Partial<State<S["allowedLocale"]>> {
  children?: Content<N> | ReactNode;
  key?: D;
  id?: D | A;
  i18nKey?: D | A;
  path?: D | A;
  variables?: Partial<FollowWayWithValues<N, A, V>> & Values;
  locale?: S["allowedLocale"];
  source?: Node;
  messages?: Node;
  hydrate?: boolean;
  preventDynamic?: boolean;
  settings?: Partial<TranslationSettings>;
  onLocaleChange?: ReactSetState<S["allowedLocale"]>;
}

export interface TranslationFC<S extends TranslationSettings = TranslationSettings, N = Node, V = Values> {
  <A extends isArray<SearchWays<N>>, D extends ArrayToString<A, S["ps"]>>(props: TranslationProps<S, N, V, A, D>): ReactNode;
}

export type TranslationNodeFC<S extends TranslationSettings = TranslationSettings, N = Node, V = Values> = TranslationFC<S, N, V> & {
  g: TranslationNodeFC<S, S["tree"][S["allowedLocale"]], V>;
  global: TranslationNodeFC<S, S["tree"][S["allowedLocale"]], V>;
  locale: S["allowedLocale"];
  locales: S["allowedLocales"];
  settings: S;
  node: N;
  values: V;
  t: TranslationType<S, N, V, S["allowedLocale"]>;
} & {
  [L in S["allowedLocale"]]: TranslationNodeFC<S, N, V>;
} & {
  [C in Children<N>]: TranslationNodeFC<S, N[C], V>;
};
