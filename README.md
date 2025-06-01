# Intl-T

### A Fully-Typed Node-Based i18n Translation Library

[![npm version](https://img.shields.io/npm/v/intl-t.svg)](https://www.npmjs.com/package/intl-t)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white&style=flat)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/-Next.js-000000?logo=next.js&logoColor=white&style=flat)](https://nextjs.org/)

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
- ⚙️ Modular and agnostic to **any framework** or **library**
- 📦 **[4kb](https://bundlephobia.com/package/intl-t) Lightweight bundle** with no dependencies and **Tree-Shakable**

## Example

```jsx
export default function Component() {
  const { t } = useTranslation("homepage");

  return (
    <>
      {/* Get translations as an object */}
      <h1>{t.title}</h1>

      {/* Use variables in your translations */}
      <h2>{t.welcome({ user: "Ivan" })}</h2>

      {/* Flexible syntax */}
      <p>{t("main", { now: Date.now() })}</p>
      <ul>
        <li>{t.features[0]}</li>
        <li>{t.features[1]({ name: "Ivan V" })}</li>
        <li>{t.features("2")({ name: "Ivan V" })}</li>
        <li>{t({ name: "Ivan V" })("features.3")}</li>
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

```json
{
  "title": "Homepage",
  "welcome": "Welcome, {user}!",
  "main": "It is {now, date, sm}",
  "features": ["Hi {name}. This is Feature 1", "Hi {name}. This is Feature 2", "Hi {name}. This is Feature 3"],
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
      "accountId": 0
    }
  },
  "values": {
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

import { createTranslation } from "intl-t";

const translation = createTranslation({
  locales: { en, es }, // It will be notify an Error in case of any difference between translation structure
  mainLocale: "en",
  // other settings like default variables, replacement placeholder strings, preferences, etc...
});

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

There are two main methods for the nodes, the use method and the get method (the get can be used as use); The use will mutate of the branches downward starting from itself, It will return the same node with its children but with the new default variables modified.

```ts
{
  base: "hello";
} // nodes with base value, will have its node as default value.
{
  child: "hello";
} // nodes with children, will have its get function as default value

"hello"["hello"][ // nodes can be only text too // or lists
  // You can put this raw values when createTranslation, but strings are not recommended.
  [[["hello"]]]
]; // You can make it as complex as you want
t[0][0][0][0];
```

The get function will receive a path where you can get into a downward node. Also you can add variables and use both, use and get. Get function will have full auto completion with all possible string ways in that point of the tree, and it will return the corresponding types for the way.

```ts
// Type-safe
t.public.page1.section1.article1.lines[0].htmltitle[0];
t.get("public.page1.section1.lines.0.htmltitle.0");
t("public.page1");
t.settings.ps = "/";
t("public/page1");
```

Remember that you can nest many mutation methods as you want.

```ts
t(v1).p1("s4.a2").n3(v2);
```

Remember that default value for nodes will be string if it has base defined, o get function if it doesn't. Also if you want to access the string with no node methods, you can use the .base property, it is only string | null in case the node doesn't have children.

```ts
t.basetext; // string with node methods
t.page1(); // get function with node methods
```

Also the nodes in its properties have some general data, like its current variables, locale details, its locale, its children property names, its keyname in parent property, the main locale, parent reference access, global reference access, etc.

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
- `t.use(variables)`: Creates a new translation instance with the given variables.

### [TranslationNode Interface](https://tsdocs.dev/docs/intl-t/types/TranslationNode.html)

The core interface representing a node in the translation tree.

```typescript
interface TranslationNode<
  S extends TranslationSettings,
  N extends Node,
  V extends Values,
  L extends S["allowedLocale"],
> {
  t: TranslationNode<S, N, V, L>;
  tr: TranslationNode<S, N, V, L>;
  parent: TranslationNode<S, N, V, L>;
  values: V;
  lang: L;
  path: string[];
  id: string;
  node: N;
  settings: S;
  use(variables: Partial<V>): TranslationNode<S, N, V & typeof variables, L>;
  get(...path: string[]): TranslationNode<S, N, V, L>;
  // ... other properties and methods
}
```

## React

intl-t provides seamless integration with React through the `useTranslation` hook:

```jsx
const MyComponent = () => {
  const { t, lang, setLang } = useTranslation("common");

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("welcome", { name: "User" })}</p>
      <button onClick={() => setLang("es")}>Switch to Spanish</button>
    </div>
  );
};
```

### Provider

Use provider to sync current locale across your application:

```jsx
export const { Translation } = createTranslation({ locales: { en, es } });

export default function Providers({ children }) {
  return <Translation locale="en">{children}</Translation>;
}
```

Also Translation component can be used as `{t("key")}` like `<Translation path="key" />`

Each node has its Translation component, `const { Translation } = t.es.key`;

### `useTranslation` Hook

React hook for accessing translations within components.

```ts
const { t, lang, setLang } = useTranslation(path?: string);
```

#### Returns:

- `t`: The translation function for the current locale.
- `lang`: The current language code.
- `setLang`: A function to change the current language.

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

## Next.js

intl-t offers special integration with Next.js for server-side rendering and routing:

For Static Rendering you will need to generate static params and in each layout implement setRequestLocale to cache the current locale.

In dynamic pages with just `await getTranslation()` you can get the translation with current locale.


### Navigation

```js
import { createNavigation } from "intl-t/next";

export const { middleware, Link } = createNavigation({ allowedLocales: ["en", "es"], defaultLocale: "en" });
```

## Hello there 👋

This translation lib was built for my own projects, so at least for me I consider the best way to handle translations. I mean nice Developer Experience, performance, ultra lightweight, full customizable, auto-complete everywhere with typescript, Translation node based, and super flexible syntax integrating the best parts of other i18n libraries. It also has its own ICU message format, and everything included with zero dependencies. And I have still many ideas to enhance it. Also supports everything from React, Next.js, to static rendering. But at the moment it is still in beta (from docs, readme, tests, example, core, everything), so it could not be totally recommended for large production projects, but I will keep working on it, to make it better. Feel free to use it, contribute to it or contact me. Thank you.
