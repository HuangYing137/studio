# EEZ Studio language resources

Language files in this directory are copied to the installed application's
`resources/locales` directory. They are intentionally kept outside
`app.asar`, so translators can edit or replace a language JSON file without
rebuilding the application.

## Simplified Chinese

- File: `zh-CN.json`
- Encoding: UTF-8
- Format: JSON object mapping the exact English source string to its translation.
- Keep keys unchanged. They are matched against the source UI text.
- Preserve placeholders, format tokens, protocol names, identifiers and code
  fragments exactly as they appear in the source.
- Restart EEZ Studio after changing a language file; the dictionary is cached
  for the lifetime of the application.

Missing keys fall back to the original English text.
