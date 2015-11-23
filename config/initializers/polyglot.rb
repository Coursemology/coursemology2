Rails.application.configure do
  config.after_initialize do
    Polyglot::Language.load_languages if Polyglot::Language.connected? &&
                                         Polyglot::Language.table_exists?
  end
end
