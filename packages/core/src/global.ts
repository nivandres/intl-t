import type { Translation } from "@intl-t/core/types";

export * from "@intl-t/global";

export default interface Global {
  Translation: Translation;
}

export type GlobalTranslation = Global extends { Translation: infer T } ? T : Translation;
export type GlobalSettings = GlobalTranslation["settings"];
export type GlobalPathSeparator = string extends GlobalSettings["ps"] ? "." : GlobalSettings["ps"];
export type GlobalLocale = GlobalSettings["allowedLocale"];
export type GlobalNode = GlobalSettings["tree"];
