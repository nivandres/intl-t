import { unstable_rootParams as rootParams } from "next/server";

export async function getRootParamsLocale<L extends string>() {
  const { locale } = await rootParams();
  // @ts-ignore
  if (this?.settings) this.settings.locale = locale;
  return locale as L;
}
