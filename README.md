# Intl-T

### A Fully-Typed Node-Based i18n Translation Library.

[![npm version](https://img.shields.io/npm/v/intl-t.svg)](https://www.npmjs.com/package/intl-t)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white&style=flat)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/-Next.js-000000?logo=next.js&logoColor=white&style=flat)](https://nextjs.org/)

![Banner](https://raw.githubusercontent.com/nivandres/intl-t/main/assets/banner.webp)

> Fully-Typed Node-Based i18n Translation Library.

`Intl T,
International Tree,
International Translations,
International T Object,
Internationalization for TypeScript,`

## Features

- 🎯 **Fully-Typed** for TypeScript with autocomplete for translation variables
- 🌲 **Node-based translations** for easy organization and management
- ✨ **Type-safe** translation keys, values and all sub-nodes
- 🚚 Supports **JSON files** and dynamic **remote** imports
- 🪄 **Flexible syntax** integrating all the best parts of other i18n libraries
- 🧩 **ICU message format** support and extended for complex and nested pluralization and formatting
- ⚛️ **React components injections** out of the box with translation variables
- 🚀 Supports **server-side rendering** and **static rendering** awith [Next.js](https://nextjs.org/) and [React](https://reactjs.org/)
- 🔄 **Dynamic importing of locales** for optimized bundle size and on-demand language loading
- ⚙️ Modular and agnostic to **any framework** or **library**
- 📦 **[4kb](https://bundlephobia.com/package/intl-t) Lightweight bundle** with no dependencies and **Tree-Shakable**

## Example

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
      "title": "Feature 4"
    }
  ],
  "page1": {
    "section1": {
      "article1": {
        "title": "Article 1"
      }
    }
  },
  "account": {
    "options": {
      "change": "Change your account settings. Your account id is {accountId}"
    },
    "values": {
      // local node values
      "accountId": 0
    }
  },
  "values": {
    // default values
    "user": "World",
    "name": "{user}",
    "now": "{(Date.now())}"
  }
}
```

## Installation

Install intl-t with your favorite package manager:

```bash
npm i intl-t
# or
bun i intl-t
```

## Guide

- [Basic Usage](#basic-usage)
- [React](#react)
- [Next.js](#nextjs)
- [Static Rendering](#static-rendering)
- [Dynamic Rendering](#dynamic-rendering)

## Basic Usage

### 1. Set up your translations

First, create JSON files for each of your supported languages.

`en.json` `es.json` `fr.json` `etc...`

```json
{
  "greeting": "Hello {user}!"
}
```

Your JSON files their keys and values can be **nested** in a multiple layer deep tree structure, so that each translation is an unique node in the tree with its mutable variables and base text.

Your translations also can have multiple placeholders, that can be replaced with variables. For example, `Hello, {user}!` has a user placeholder, that can be replaced. We can define variables in this way to be used for typescript autocomplete and validation:

```jsonc
{
  "greeting": "Hello {user}!",
  "items": {
    // nested translations
    "count": "Hey {user}, you have {count} items!",
    "values": {
      "count": 0
    }
  },
  "values": {
    // default value
    "user": "World"
  }
}
```

Each node can herit varaibles from its parent node, so that we can define default values for all nodes in the tree and override them in each node, or just define isolated variables for each node.

```json
{
  "greeting": {
    "base": "Hello {user}!",
    "values": {
      "user": "World"
    }
  }
}
```

Through typescript we can get autocomplete for the variables in each translation node. How it works? In Object nodes, base refers to the translation text of the current node ("Hello {user}!"), and values refers to the variables of the current node and its heritage ("{user}"). Base nodes can only have base text, and their values can only be inherited. Values is an object with the variable names (keys) and their default values (values). Anyway, you can run the replace functions without declaring variables, but it won't have autocomplete.

Remember all your JSON files for each language should have the same structure, keys, values and all its node in each tree. In case there is some difference between the json files, typescript will detect it and warn you.

```jsonc
// en.json
{
  "homepage": {
    "welcome": "Welcome, {user}!"
  }
}

// es.json
{
  "homepage": {
    "welcome": "Bienvenido, {user}!"
  }
}
```

In these case variables are not declared, it will work, but no will have autocomplete.

```jsonc
{
  "store": {
    "product_title": ["sunglasses", "watch", "chain"], // you can put complex nodes into lists too
    "product_description": {
      "base": [
        // base is the default text string for the curren node
        "These stylish sunglasses cost ${price} and offer 100% UV protection.",
        "The elegant watch is priced at just ${price} and comes with a stainless steel strap.",
        // Each node inherits the values from its parent
        "Our fashionable chains are available for just ${price} and make a perfect accessory."
      ],
      "values": {
        "price": 10 // nodes can be numbers | string | node arrays | record of arrays (object)
      }
    }
  }
}
```

You can access all nodes individually with all their methods for mutate and modify their branches.

### 2. Create translation configuration file

Create a custom setup file for importing your JSON translation files. `./i18n/translation.ts`

```ts
import en from "@/public/locales/en.json";
import es from "@/public/locales/es.json";

import { createTranslation } from "intl-t"; // intl-t/core | intl-t/react | intl-t/next. Default is core

const translation = createTranslation({
  locales: { en, es }, // It will be notify an Error in case of any difference between translation structure
  mainLocale: "en",
  // other settings like default variables, replacement placeholder strings, preferences, etc...
});

// or
// const translation = new Translation({ locales: { en, es }, mainLocale: "en" }); // both are same and support types

// T object is the core of the library.

export const { t } = translation; // translation is t itself. t contains the t object. (t.t)

console.log(t); // "Enjoy your t object :)"
```

```ts
export const { useTranslation, getTranslation, settings, t } = translation;
const { t } = useTranslation();
```

#### Translation Node Logic

Translation will be based on translation nodes, each translation node have its base value, default variables, children, parent, etc. The translation core object is the tree of all these nodes. The root of the object will be the default locale tree with properties for all locale tree. All in this tree are nodes, so all of them have the same methods. But for typescript, depending if is root o has base text the methods will differ.

Each node can be callable and usable directly. They work like a function, object and string as needed.

```ts
{
  base: "hello";
  child: "hello";
} // nodes can have base value and children
"hello"["hello"][ // nodes can be only text too // or lists
  // You can put this raw values when createTranslation
  [[["hello"]]]
]; // You can make it as complex as you want
t[0][0][0][0];
```

```ts
// Type-safe
t.public.page1.section1.article1.lines[0].htmltitle[0];
t("public.page1.section1.lines.0.htmltitle.0");
t.settings.ps = "/"; // You can change the path separator
t("public/page1");
```

Remember that you can nest many mutation methods as you want.

```ts
t(v1).p1("s4.a2").n3(v2);
```

Also the nodes in its properties have some general data, like its current variables, locale details, its locale, its children property names, its keyname in parent property, the main locale, parent reference access, global reference access, etc.

```ts
const {
  global: {
    pages: { title },
  },
} = t;
title === t.g("pages.title"); // true
```

### 3. Use translations in your code

```ts
console.log(t("greeting", { name: "John" })); // Output: Hello, John!
console.log(t("items.count", { count: 2 })); // Output: You have 2 items.

// Switch language
console.log(t.es("greeting", { name: "Juan" })); // Output: ¡Hola, Juan!
```

#### Nested out of the box

```ts
{
  user: {
    profile: {
      title: "User Profile",
      greeting: "Welcome back, {name}!"
    }
  }
};

console.log(t('user.profile.title')); // Output: User Profile
console.log(t('user.profile.greeting', { name: 'Alice' })); // Output: Welcome back, Alice!
```

#### Dynamic Keys

```ts
const key = "user.profile.greeting";
console.log(t(key, { name: "Bob" })); // Output: Welcome back, Bob!
```

#### Pluralization

```ts
{
  items: "You have {count, plural, =0 {no items} one {# item} other {# items}}.";
}

console.log(t("items", { count: 0 })); // Output: You have no items.
console.log(t("items", { count: 1 })); // Output: You have 1 item.
console.log(t("items", { count: 5 })); // Output: You have 5 items.
```

#### Date and Number Formatting

```ts
{
  date: "Today is {now, date, full}",
  price: "The total is {amount, number, currency}"
};

console.log(t('date', { now: new Date() })); // Output: Today is Wednesday, April 7, 2023
console.log(t('price', { amount: 123.45 })); // Output: The total is $123.45
```

#### Nested Variable Injection with operations.

```ts
{
  "greeting": "Hello, {user}! {age, <9 {you are lying about your age, you are at least {#+3, =10 {ten} !=10{#}}, {user}}, #>123 'you are lying, you are not # years old', other{you're # years old, ok} }",
}

console.log(t("greeting", { user: "John", age: 7 })); // Output: Hello, John! You are lying about your age, you are at least ten, John

```

## [API Reference](https://tsdocs.dev/docs/intl-t)

### [`createTranslation(options)`](https://tsdocs.dev/docs/intl-t/interfaces/TranslationSettings.html)

Creates a translation instance with the given options.

```typescript
interface TranslationSettings<L extends Locale, M extends L, T extends Node, V extends Values> {
  locales: Record<L, T> | L[];
  mainLocale?: M;
  variables?: V;
  plugins?: TranslationPlugin[];
  // ... other options
}

const { t } = createTranslation<TranslationSettings>(options);
```

#### Options:

- `locales`: An object containing locale keys and their corresponding translation trees, or an array of allowed locales.
- `mainLocale`: The primary locale for the application.
- `variables`: Global variables available in all translations.
- `plugins`: An array of plugins to extend functionality.

### Translation Function: `t`

The main translation function returned by `createTranslation`.

```typescript
t(key: string, variables?: Values): string
t[locale](key: string, variables?: Values): string
t.use(variables: Values): TranslationNode
```

#### Methods:

- `t(key, variables?)`: Translates the given key with optional variables.
- `t[locale](key, variables?)`: Translates using a specific locale.
- `t(variables)`: Creates a new translation instance with the given variables.

### [TranslationNode Interface](https://tsdocs.dev/docs/intl-t/types/TranslationNode.html)

The core interface representing a node in the translation tree.

```typescript
interface TranslationNode<S extends TranslationSettings, N extends Node, V extends Values, L extends S["allowedLocale"]> {
  t: TranslationNode<S, N, V, L>;
  tr: TranslationNode<S, N, V, L>;
  parent: TranslationNode<S, N, V, L>;
  values: V;
  lang: L;
  path: string[];
  id: string;
  node: N;
  settings: S;
  // ... other properties and methods
}
```

## React

intl-t provides seamless integration with React through the `useTranslation` hook:

```jsx
const MyComponent = () => {
  const { t, locale, setLocale } = useTranslation("common");

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("welcome", { name: "User" })}</p>
      <button onClick={() => setLocale("es")}>Switch to Spanish</button>
    </div>
  );
};
```

### Provider

Use provider to sync current locale across your application:

```jsx
import { createTranslation } from "intl-t/react";

export const { Translation, useTranslation } = createTranslation({ locales: { en, es } });

export default function Providers({ children }) {
  return <Translation>{children}</Translation>;
}
```

```jsx
import { useLocale } from "intl-t/react";
export default function Providers({ children }) {
  const { locale, setLocale } = useLocale(); // handle locale state from client-side. From localStorage, cookie, navigator, etc...
  return (
    // Only use locale, and onLocaleChange when you want to handle locale manually.
    <Translation locale={locale} onLocaleChange={setLocale}>
      {children}
    </Translation>
  );
  // When you don't specify locale or onLocaleChange, it already uses `useLocale` hook internally.
  // So don't specify locale prop, if you want to set default locale, set it from createTranslation settings.
}
```

Also Translation component can be used as `{t("hello")}` like `<Translation path="hello" />` or `<Translation.hello />` will work too.

Each node has its Translation component, `const { Translation } = t.hello;`

TranslationProvider from translation node also have some other aliases, `Tr`, `Trans`, `TranslationProvider`

```tsx
<Translation path="hello" />
<Translation.hello />
<Trans.hello variables={{ name: "Ivan" }} />
```

If this component contains children it will work as provider, if not it will return the translation node text.

> Note: This component works with Next.js and React Server Components

### `useTranslation` Hook

React hook for accessing translations within components.

```ts
const { t, locale, setLocale } = useTranslation(path?: string);
```

#### Returns:

- `t`: The translation function for the current locale.
- `locale`: The current language code.
- `setLocale`: A function to change the current language.

### React Component Injection out of the box

```jsx
{
  welcome: "Welcome to <b>{site}</b><globe />. <Link href='{startLink}'>Get started</Link>!. <br /><h3 className=\"title\">Title</h3>";
}

const Welcome = () => (
  <div>
    {t("welcome", {
      site: "My Awesome Site",
      startLink: "/start",
      globe: () => <Globe />,
      Link: props => <a href={props.href}>{props.children}</a>,
    })}
  </div>
);
```

## React Patch

If you are using React, in some frameworks you may need to patch React to support translation objects. (Farmfe and Next.js builds)
You can do it by importing the patch function and passing the React, jsx and jsxDEV modules directly to it.

```ts
//i18n/patch.ts
import React from "react";
import jsx from "react/jsx-runtime";
import jsxDEV from "react/jsx-dev-runtime";
import patch from "intl-t/patch";

patch(React, jsx, jsxDEV);
```

And then import it at the top of your translation file

```ts
//i18n/translation.ts
import "./patch";
// ...
```

## Next.js

intl-t offers special integration with Next.js for server-side rendering and routing:

For Static Rendering you will need to generate static params and in each layout implement setRequestLocale to cache the current locale.

In dynamic pages with just `await getTranslation()` you can get the translation with current locale.

> Note: `intl-t/next` is for Next.js App with RSC. For Next.js Pages you should use `intl-t/react` instead, and `intl-t/navigation` for Next.js Navigation and Routing tools.

### Navigation

```ts
//i18n/navigation.ts
import { createNavigation } from "intl-t/navigation";

export const { middleware, Link, generateStaticParams } = createNavigation({ allowedLocales: ["en", "es"], defaultLocale: "en" });
```

```tsx
//app/layout.tsx
import { Translation } from "@/i18n/translation";
import { setRequestLocale } from "intl-t/next";
export { generateStaticParams } from "@/i18n/navigation";

interface Props {
  params: Promise<{ locale: typeof Translation.locale }>;
  children: React.ReactNode;
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!Translation.locales.includes(locale)) return;
  setRequestLocale(locale);
  return (
    <html lang={locale}>
      <body>
        <Translation>{children}</Translation>
      </body>
    </html>
  );
}
```

That translation component is a React Server Component that handles the current locale and the corresponding translations to be sent to the client and its context.

Also, `Translation` will work too as a client-side translation component.

```ts
//middleware.ts
export { middleware as default } from "@/i18n/navigation";

export const config = {
  // middleware matcher config
};
```

From `createNavigation` you can get:

- `middleware`: Middleware function to be used in `middleware.ts`
- `generateStaticParams`: Function to generate static params
- `useRouter`: React hook to get router config with binded `locale` and `pathname` values
- `Link`: React component to create links with binded `locale` and `pathname` values
- `redirect`: Binded Next.js `redirect` function
- `permanentRedirect`: Binded Next.js `permanentRedirect` function
- `getLocale`: Function to get current locale at server
- `useLocale`: React hook to get current locale
- `usePathname`: React hook to get current pathname without locale prefix if exist
- `getPathname`: Function to get current pathname without locale prefix if exist

### Static Rendering

```ts
//i18n/translation.ts
import { Translation } from "intl-t/next";

export const { getTranslation, setLocale } = new Translation({ locales: { en: "Hello world" } });
```

```jsx
import { getTranslation, setLocale } from "@/i18n/translation";
import { setRequestLocale } from "intl-t/next";

export default function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // or
  // setLocale(locale); Same as setRequestLocale but typed with available locales
  const { t } = getTranslation();
  return <div>{t}</div>; // hello world
}
```

### Dynamic Rendering

Same configuration. Just middleware, no need any more to set locale in dynamic pages.

```tsx
export default async function Page() {
  const { t } = await getTranslation(); // Get locale from headers through middleware
  return <div>{t}</div>; // hello world
}
```

### Next.js React patch

```ts
import React from "react";
import jsx from "react/jsx-runtime";
import jsxDEV from "react/jsx-dev-runtime";
import patch from "intl-t/react";

process.env.NODE_ENV !== "development" && patch(React, jsx, jsxDEV);
```

## Dynamic Locales import

To dynamically import locales, set node values as functions to be called when needed.

```ts
import { Translation } from "intl-t";

export const t = new Translation({
  locales: {
    en: () => import("./en.json"),
    es: () => import("./es.json"),
  },
});

await t; // Automatically imports the locale that is needed at client
```

```ts
import { createTranslation } from "intl-t/core";

// use await at createTranslation to preload default locale
export const { t } = await createTranslation({
  locales: {
    en: () => import("./en.json"),
    es: () => import("./es.json"),
  },
  hidratation: false, // disable hidratation to automatically load the correct client locale
});
```

### `getLocales` function

This is the recommended way to load locales dynamically depending if it is client or server.

```ts
import { createTranslation, getLocales } from "intl-t";
import { allowedLocales } from "./locales"; // as locale list, e.g. ["en", "es"] as const;

const locales = await getLocales(locale => import(`./messages/${locale}.json`), allowedLocales); // Preload locales at server and dynamically imported at client

export const { t } = createTranslation({ locales });
```

## Hello there

This translation library was originally built for my own projects, aiming to provide the best possible developer experience: high performance, ultra-lightweight, fully customizable, and with TypeScript autocomplete everywhere. It uses a translation node-based approach and offers a super flexible syntax, integrating the best features from other i18n libraries. It includes its own ICU message format, works out of the box with React and Next.js, supports static rendering, and has zero dependencies. While it's still under active development and may not yet be recommended for large-scale production projects, I am committed to improving it further. Feel free to use it, contribute, or reach out with feedback. Thank you!

## Support

If you find this project useful, consider supporting its development ☕

[![Donate via PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://www.paypal.com/ncp/payment/PMH5ASCL7J8B6)
