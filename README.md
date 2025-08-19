# Intl-T

### A Fully-Typed Object-Based i18n Translation Library.

[![npm version](https://img.shields.io/npm/v/intl-t.svg)](https://www.npmjs.com/package/intl-t)
[![TypeScript](https://img.shields.io/badge/-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Discord Chat](https://img.shields.io/discord/1063280542759526400?label=Chat&logo=discord&color=blue)](https://discord.gg/5EbCXKpdyw)
[![Donate via PayPal](https://img.shields.io/badge/PayPal-Donate-blue?logo=paypal)](https://www.paypal.com/ncp/payment/PMH5ASCL7J8B6)
[![Star on Github](https://img.shields.io/github/stars/nivandres/intl-t)](https://github.com/nivandres/intl-t)

[![Banner](https://raw.githubusercontent.com/nivandres/intl-t/main/assets/banner.webp)](https://intl-t.dev/)

> Fully-Typed Node-Based i18n Translation Library.

`Intl T,
International Tree,
International Translations,
International T Object,
Internationalization for TypeScript,
International T`

<p align="center">
  <a href="https://intl-t.dev/"><strong>→ Visit Intl-T Web 💻</strong></a>
</p>

## Features

- 🎯 **Fully-Typed** for TypeScript with autocomplete for translation variables
- 🌲 **Node-based translations** for easy organization and management
- ✨ **Type-safe** translation keys, values and all sub-nodes
- 🚚 Supports **JSON files** and dynamic **remote** imports
- 🪄 **Flexible syntax** integrating all the best parts of other i18n libraries
- 🧩 **ICU message format** support and extended for complex and nested pluralization and formatting
- ⚛️ **React components injections** out of the box with translation variables
- 🚀 Supports **server-side rendering** and **static rendering** with [Next.js](https://nextjs.org/) and [React](https://reactjs.org/)
- 🔄 **Dynamic importing of locales** for optimized bundle size and on-demand language loading
- ⚙️ Modular and agnostic to **any framework** or **library**
- 📦 **[4kb](https://bundlephobia.com/package/intl-t) Lightweight bundle** with no external dependencies and **Tree-Shakable**

## Demo

```jsx
export default function Component() {
  const { t } = useTranslation("homepage");

  return (
    <>
      <h1>{t("title")}</h1>
      {/* Get translations as an object or function */}
      <h2>{t.title}</h2>

      {/* Use variables in your translations */}
      <span>{t("welcome", { user: "Ivan" })}</span>
      <span>{t.summary(data)}</span>
      {/* Flexible syntax */}

      <p>{t("main", { now: Date.now() })}</p>
      <ul>
        {/* Array of translations */}
        {t.features.map(t => (
          <li key={t.id} title={t("title")}>
            {t}
          </li>
        ))}
      </ul>
      <ul>
        <li>{t.features[0]}</li>
        <li>{t("features.1", { name: "Ivan V" })}</li>
        <li>{t("features")[2]({ name: "Ivan V" })}</li>
        <li>{t({ name: "Ivan V" }).features("3")}</li>
      </ul>
      {/* Node-based translations */}
      <p>{t.page1.section1.article1.title}</p>
      <p>{t("page1/section1").article1("title")}</p>
      {/* Full typesafe with completion for variables */}
      <p>{t({ day: "Monday" }).account(UserVariables).options.change}</p>
    </>
  );
}
```

```jsonc
// en.json
{
  "title": "Homepage",
  "welcome": "Welcome, {user}!", // support ICU message format
  "summary": "{count, plural, =0 {no items} one {# item} other {# items}}",
  "main": "It is {now, date, sm}",
  "features": [
    "Hi {name}. This is Feature 1",
    "Hi {name}. This is Feature 2",
    "Hi {name}. This is Feature 3",
    {
      "base": "Hi {name}. This is Feature 4 with html title", // base is default text for objects
      "title": "Feature 4",
    },
  ],
  "page1": {
    "section1": {
      "article1": {
        "title": "Article 1",
      },
    },
  },
  "account": {
    "options": {
      "change": "Change your account settings. Your account id is {accountId}",
    },
    "values": {
      // default values for this node
      "accountId": 0,
    },
  },
  "values": {
    // default values
    "user": "World",
    "name": "{user}",
    "now": "{(Date.now())}",
  },
}
```

### [**→ Read the full Intl-T documentation**](https://intl-t.dev/docs)

## Support

If you find this project useful, [consider supporting its development ☕](https://www.paypal.com/ncp/payment/PMH5ASCL7J8B6) or [leave a ⭐ on the Github Repo.](https://github.com/nivandres/intl-t) Also, if you need direct support or help, please don't hesitate to contact me.

[![Donate via PayPal](https://img.shields.io/badge/PayPal-Donate-blue?logo=paypal)](https://www.paypal.com/ncp/payment/PMH5ASCL7J8B6) [![Star on Github](https://img.shields.io/github/stars/nivandres/intl-t)](https://github.com/nivandres/intl-t)
