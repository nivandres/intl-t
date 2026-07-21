# Intl-T

### A Fully-Typed Object-Based i18n Translation Library.

[![npm version](https://img.shields.io/npm/v/intl-t.svg)](https://www.npmjs.com/package/intl-t)
[![TypeScript](https://img.shields.io/badge/-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Donate via Github Sponsors](https://img.shields.io/github/sponsors/nivandres?label=Sponsors&color=hotpink&logo=github)](https://github.com/sponsors/nivandres)
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

- 🌲 **Node-based translations** — the tree is the API: `t.page.section.title`
- 🎯 **Fully-typed** and **type-safe** translation keys, values and all sub-nodes
- 🚚 Supports **JSON files** and dynamic **remote** imports on demand
- 🪄 **Flexible and familiar drop-in syntax** integrating all the best parts of other i18n libraries
- 🧩 **ICU message format** support and extended for complex and nested pluralization and formatting
- ⚛️ **React components injections** out of the box with typed chunks and variables
- 🚀 Supports **SSR**, **RSC** and **Static Rendering** with [Next.js](https://nextjs.org/), serverless friendly
- 🔄 **On-demand locale loading** for lazy per-language chunks of just a few KB
- ⚙️ Modular and agnostic to **any framework** or **library**
- 📦 **[6kb](https://bundlephobia.com/package/intl-t) Lightweight bundle** with no dependencies, no side effects, and Tree-Shakable

## Installation

```bash
npm install intl-t # or: bun add intl-t · pnpm add intl-t · yarn add intl-t
```

Zero external dependencies · TypeScript ≥ 5 · Node 18+, Bun, Deno, Edge & browsers

## Demo

```jsx
export default function Component() {
  const { t } = useTranslation("homepage");

  return (
    <>
      <h1>{t.title}</h1>
      <span>{t("welcome", { user: "Ivan" })}</span>
      <span>{t.summary({ count: 4 })}</span>
      <ul>
        {t.features.map(t => (
          <li key={t.id}>{t}</li>
        ))}
      </ul>
      <p>{t.page1.section[0].article1.title}</p>
      <p>{t("page1.section.0").article1("title")}</p>
      <p>{t.account(UserVariables).options.change}</p>
    </>
  );
}
```

<details>
<summary>View demo JSON source</summary>

```jsonc
// en.json
{
  "title": "Homepage",
  "welcome": "Welcome, {user}!", // support ICU message format
  "summary": "{count, plural, =0 {no items} one {# item} other {# items}}",
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
    "section": [
      {
        "article1": {
          "title": "Article 1",
        },
      },
    ],
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
  },
}
```

</details>

### [**→ Read the full Intl-T documentation**](https://intl-t.dev/docs)

## Support

If you find this project useful, [consider supporting its development ☕](https://github.com/sponsors/nivandres) or [leave a ⭐ on the Github Repo.](https://github.com/nivandres/intl-t) Also, if you need direct support or help, please don't hesitate to contact me.

[![Donate via Github Sponsors](https://img.shields.io/github/sponsors/nivandres?label=Sponsors&color=hotpink&logo=github)](https://github.com/sponsors/nivandres) [![Star on Github](https://img.shields.io/github/stars/nivandres/intl-t)](https://github.com/nivandres/intl-t)
