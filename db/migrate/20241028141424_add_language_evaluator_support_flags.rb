# These whitelists are accurate as of the date this migration is merged and performed (2024-11-09)
CODAVERI_WHITELIST =
  [Coursemology::Polyglot::Language::Python::Python3Point4,
  Coursemology::Polyglot::Language::Python::Python3Point5,
  Coursemology::Polyglot::Language::Python::Python3Point6,
  Coursemology::Polyglot::Language::Python::Python3Point7,
  Coursemology::Polyglot::Language::Python::Python3Point9,
  Coursemology::Polyglot::Language::Python::Python3Point10,
  Coursemology::Polyglot::Language::Python::Python3Point12,
  Coursemology::Polyglot::Language::R]

KODITSU_WHITELIST =
  [Coursemology::Polyglot::Language::CPlusPlus,
  Coursemology::Polyglot::Language::Python::Python3Point4,
  Coursemology::Polyglot::Language::Python::Python3Point5,
  Coursemology::Polyglot::Language::Python::Python3Point6,
  Coursemology::Polyglot::Language::Python::Python3Point7,
  Coursemology::Polyglot::Language::Python::Python3Point9,
  Coursemology::Polyglot::Language::Python::Python3Point10,
  Coursemology::Polyglot::Language::Python::Python3Point12]

DEPRECATED_LANGUAGES =
  [
    Coursemology::Polyglot::Language::Python::Python2Point7,
    Coursemology::Polyglot::Language::Python::Python3Point4,
    Coursemology::Polyglot::Language::Python::Python3Point5,
    Coursemology::Polyglot::Language::JavaScript,
  ]

class AddLanguageEvaluatorSupportFlags < ActiveRecord::Migration[7.2]
  def change
    add_column :polyglot_languages, :evaluator_whitelisted, :boolean, default: true, null: false
    add_column :polyglot_languages, :codaveri_whitelisted, :boolean, default: false, null: false
    add_column :polyglot_languages, :koditsu_whitelisted, :boolean, default: false, null: false
    add_column :polyglot_languages, :testcase_type, :string, default: 'expr', null: false

    CODAVERI_WHITELIST.each do |language|
      Coursemology::Polyglot::Language.where(type: language.name).update_all(codaveri_whitelisted: true)
    end

    KODITSU_WHITELIST.each do |language|
      Coursemology::Polyglot::Language.where(type: language.name).update_all(koditsu_whitelisted: true)
    end

    DEPRECATED_LANGUAGES.each do |language|
      Coursemology::Polyglot::Language.where(type: language.name).update_all(enabled: false)
    end

    Coursemology::Polyglot::Language.where(type: Coursemology::Polyglot::Language::R.name).update_all(evaluator_whitelisted: false, testcase_type: 'io')
  end
end
