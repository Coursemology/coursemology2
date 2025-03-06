# Coursemology Client

The front-end UI of Coursemology is written using [React.js](https://facebook.github.io/react/). Most of our pages and their components are written in TypeScript as [React functional components](https://react.dev/learn/your-first-component#defining-a-component), though there are some older parts in JS or using class components that should be migrated to functional components in the future.

## Getting Started

These commands should be run with the working directory `coursemology2/client` (the same directory this README file is in)

1. Install javascript dependencies

   ```sh
   yarn
   ```

2. Run the following command to initialize `.env` files over here

   ```sh
   cp env .env
   ```

   You may need to add specific API keys (such as the [GOOGLE_RECAPTCHA_SITE_KEY](https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha.-what-should-i-do)) to the .env files for testing specific features.

3. To start the frontend, run

  ```sh
  yarn build:development
  ```

## Translations

To generate a list of strings that need to be translated,
run the following command from the `client` directory:

```sh
yarn run extract-translations
```

This will extract all translations from the source codes
and then combine all the keys into a single file `/client/locales/en.json`.

Next, using that file as a reference, create or update other translations in the `client/locales` folder.


## Code styling
- Prepend Immutable.js variables names with `$$`.

## Front-end styling
As of https://github.com/Coursemology/coursemology2/pull/5049, our client is transitioning to [Tailwind CSS](https://tailwindcss.com) for all front-end styling. Tailwind CSS is a [utility-first CSS framework](https://tailwindcss.com/docs/utility-first) for rapidly building custom user interfaces. It offers a different paradigm of traditionally writing 'semantic' CSS, allowing for definitive stylesheet consistency, ease of configuration, and better developer experience.

We strongly recommend installing [Prettier](https://prettier.io/), as we have integrated [Tailwind's Prettier plugin](https://tailwindcss.com/blog/automatic-class-sorting-with-prettier) to help maintain our utility class names.

### Styling guidelines
#### ✅ Only use Tailwind utilities for styling.  
Do NOT, ever, use inline styles, [MUI's `sx` prop](https://mui.com/system/getting-started/the-sx-prop/), raw CSS, Sass stylesheets, [`styled-components`](https://mui.com/material-ui/guides/interoperability/#styled-components), or [Emotion](https://mui.com/material-ui/guides/interoperability/#emotion).

>**Note**
>If you see any of these around our codebase, you may replace them with Tailwind utilities.

#### ✅ Only use relative unit values.
Use `pt` or `rem` as units for values. Do not use `px`; it is an absolute unit. There are [many articles](https://uxdesign.cc/why-designers-should-move-from-px-to-rem-and-how-to-do-that-in-figma-c0ea23e07a15) that support this, but essentially, using relative units means we are respecting the display scaling of the browser and target device, allowing our site to be more accessible and independent of media display scaling.

#### ✅ Mobile-first approach: Start from small screens, work towards large screens.
Tailwind's media modifiers, e.g., `sm:`, `md:`, etc. are `min-width` media queries. So, start your designs from small screens, then slowly work towards large screens and apply your media modifiers appropriately. This is known as the mobile-first approach, and [is the usual recommendation when building responsive websites](https://web.dev/responsive-web-design-basics/#major-breakpoints).

#### ✅ Embrace defaults.
For brevity, keep our class names short and brief. If you have added `flex`, there is no need to add `flex-row` if `flex-col` is not applied, because `flex-direction` is `row` by default. Use defaults to override non-default values. This also applies to code styling and default React props, actually.

#### ✅ Abstract utilities and components.
If you find yourself battling with long and repeated utilities, consider refactoring. For example, if you find yourself duplicating `ml-4` on all 6 components, consider wrapping them all in a `div` and set the `ml-4` there. [Read Tailwind's article on Reusing Styles here](https://tailwindcss.com/docs/reusing-styles).

#### ✅ Relax; get over the small pixel details.
Do not fret over 1-2 pixels and resort to arbitrary values or custom components unless necessary. The point of using Tailwind utilities is consistency across the entire app, not being pixel perfect.

#### ✅ Use MUI's handles for text and colour; define them in Tailwind.
There are some MUI handles that you may continue to use, for example:
```jsx
<Container maxWidth="lg">
<Grid container spacing={2}>
<Grid item xs={8}>
<Typography variant="body1" color="text.secondary">
<Button color="error">
```
- `maxWidth="lg"` is legal because the breakpoint `lg` is defined in Tailwind and linked to MUI.
- `spacing={2}` is legal because the value `2` translates to `2rem`. [See MUI's Spacing](https://mui.com/material-ui/customization/spacing/#main-content).
- `xs={8}` is legal because `xs` is a Tailwind-defined breakpoint, and `8` translates to `8rem`.
- `variant="body1"` is legal because we are using [Material Design's type system](https://material.io/design/typography/the-type-system.html). In fact, always use `Typography` when displaying texts. These are configurable in MUI `Theme` and thus Tailwind.
- `color="error"` is legal because these colour namespaces are configurable in MUI `Theme` and thus Tailwind.

These built-in styling props are allowed because it makes our code more readable. Unless you are building a custom component, you should not have too many Tailwind utilities. As much as we are using Tailwind, we must also respect MUI component's inbuilt styles. If you still want to override MUI, consider using [the unstyled counterpart of the component instead](https://mui.com/base/getting-started/overview/).

>**Note** If all you need is a simple stack or organisation, consider `div`s instead of `Grid`s or `Container`s. Less imports, shorter codes!

#### ❌ Refrain from using [arbitrary values](https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values).
Arbitrary values allow one to supply any hardcoded value in Tailwind utilities, e.g., `pb-[10px]` will apply a `padding-bottom: 10px`. If we have too many of this arbitrary utilities, we are basically reverting to inline styles.

Use arbitrary values only when Tailwind does not support it, or you really need to use it for one-time styling. For example, when aligning elements to MUI `Checkbox` or `Radio` which have widths of exactly 34 pixels, you may use `ml-[34px]`, but use it once in a `div`, and put all the aligned elements in it.

If you find yourself using the same arbitrary value many times, you may consider [creating a custom utility for it](https://tailwindcss.com/docs/adding-custom-styles#adding-custom-utilities).
>**Warning**
>Always remember that the whole point of using Tailwind is to reuse CSS attributes as utilities. If one creates a custom utility that has many CSS styles in it, are we not just reverting back to using raw CSS?

#### ❌ Do NOT use [MUI's `Box` component](https://mui.com/material-ui/react-box/).
The `Box` component is a wrapper for short CSS utility styling and accessing the `sx` prop. If you are looking for a literal box to wrap your components and apply some styles, use a `div` and Tailwind utilities.

There are some exceptions, however, to using `Box`. For example, when passing children props from a parent MUI component. See [this example in a country select `Autocomplete`](https://mui.com/material-ui/react-autocomplete/#country-select) where `Box` received a spread `props` from the `renderOption` prop. This usage is legal because `Box` here is used as an API operable and not (wholly) for styling.

#### ❌ Do NOT give mysterious spaces and margins to reusable components.
When making reusable components, e.g., `TextField`s, `Checkbox`es, or `Button`s alike, do not give them fixed margins or mysterious spaces.

The most common mistake is to give `margin-bottom`s or `padding-bottom`s to these components so that they are spaced when stacked. Instead of fixing these spaces to the reusable component, let the layout/container component set the space.

For example, instead of doing this:
```html
<div>
  <TextField label="Email address" />  <!-- ❌ TextField has className="mb-4" -->
  <Button>Log in</Button>              <!-- ❌ Button has className="mb-4" -->
  <Link>Create a new account</Link>    <!-- ❌ Link has className="mb-4" -->
</div>
```

do this instead:
```html
<div className="space-y-4">
  <TextField label="Email address" />  <!-- ✅ TextField defines no margins -->
  <Button>Log in</Button>              <!-- ✅ Button defines no margins -->
  <Link>Create a new account</Link>    <!-- ✅ Link defines no margins -->
</div>
```

This ensures consistent spacing between your components, and you no longer need to worry about the last component having a blank space.
>**Note** Remember, a reusable component is only responsible for the space it manages, not beyond itself.

<div align="center">
  <img src="https://user-images.githubusercontent.com/51525686/193975875-5b7800c2-e79f-4e4e-a722-6be6bc497470.svg">
</div>
  
#### ❌ Do NOT use `!important` unless necessary.
`!important` is applicable to Tailwind utilities by prefixing them with `!`, e.g., `!ml-4`. Use this sparingly, and only for good reasons, e.g., overriding `space-y-4`, Bootstrap utilities, or MUI built-in styles. Having `!important` everywhere makes it hard to refactor and debug styles.
