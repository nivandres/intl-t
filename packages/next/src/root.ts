// @ts-ignore unstable_rootParams has been removed.
import { unstable_rootParams as rootParams } from "next/server";

export async function getRootParamsLocale<L extends string>() {
  const { locale } = await rootParams();
  // @ts-ignore optional binding
  if (this?.settings) this.settings.locale = locale;
  return locale as L;
}
