Rails.application.configure do
  Coursemology::Polyglot.eager_load!
  config.after_initialize do
    language_base = Coursemology::Polyglot::Language
    language_base.load_languages if language_base.connected? && language_base.table_exists?
  end
end
