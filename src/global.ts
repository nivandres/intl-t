import { Translation } from "./core";

export default interface Global {
  // Translation: Translation;
}

export type GlobalTranslation = Global extends { Translation: infer T } ? T : Translation;
export type GlobalSettings = GlobalTranslation["settings"];
export type GlobalPathSeparator = GlobalSettings["ps"];
export type GlobalLocale = GlobalSettings["allowedLocale"];
export type GlobalNode = GlobalSettings["tree"];
