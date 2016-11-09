# Coursemology Frontend

## Translations

To generate a list of strings that need to be translated,
run the following command from the `client` directory:

```sh
npm run extract-translations
```

This will extract translations keys and their default `en` translations to `/client/build/messages`
and then combine all the keys into a single file `/client/build/locales/en.json`.

Next, using `en.json` as reference, create or update other translations at `client/locales`.


## Style

- Prepend Immuatable.js variables names with `$$`.
