# frozen_string_literal: true
namespace :db do
  # This rake updates the *_whitelisted fields in the polyglot_languages table. It was created
  # with the migration introducing these flags (20241028141424_add_language_whitelist_flags.rb)
  # It should be run whenever any values in those flags need to be changed
  # (e.g. when a new language is added)
  CODAVERI_EVALUATOR_WHITELIST =
    [
      Coursemology::Polyglot::Language::Python::Python3Point4,
      Coursemology::Polyglot::Language::Python::Python3Point5,
      Coursemology::Polyglot::Language::Python::Python3Point6,
      Coursemology::Polyglot::Language::Python::Python3Point7,
      Coursemology::Polyglot::Language::Python::Python3Point9,
      Coursemology::Polyglot::Language::Python::Python3Point10,
      Coursemology::Polyglot::Language::Python::Python3Point12,
      Coursemology::Polyglot::Language::Python::Python3Point13,
      Coursemology::Polyglot::Language::Java::Java17,
      Coursemology::Polyglot::Language::Java::Java21,
      Coursemology::Polyglot::Language::R::R4Point1,
      Coursemology::Polyglot::Language::JavaScript::JavaScript22,
      Coursemology::Polyglot::Language::CSharp::CSharp5Point0,
      Coursemology::Polyglot::Language::Go::Go1Point16,
      Coursemology::Polyglot::Language::Rust::Rust1Point68,
      Coursemology::Polyglot::Language::TypeScript::TypeScript5Point8
    ].freeze

  QUESTION_GENERATION_WHITELIST =
    [
      Coursemology::Polyglot::Language::Python::Python3Point4,
      Coursemology::Polyglot::Language::Python::Python3Point5,
      Coursemology::Polyglot::Language::Python::Python3Point6,
      Coursemology::Polyglot::Language::Python::Python3Point7,
      Coursemology::Polyglot::Language::Python::Python3Point9,
      Coursemology::Polyglot::Language::Python::Python3Point10,
      Coursemology::Polyglot::Language::Python::Python3Point12,
      Coursemology::Polyglot::Language::Python::Python3Point13,
      Coursemology::Polyglot::Language::Java::Java17,
      Coursemology::Polyglot::Language::Java::Java21,
      Coursemology::Polyglot::Language::R::R4Point1,
      Coursemology::Polyglot::Language::JavaScript::JavaScript22,
      Coursemology::Polyglot::Language::CSharp::CSharp5Point0,
      Coursemology::Polyglot::Language::Go::Go1Point16,
      Coursemology::Polyglot::Language::Rust::Rust1Point68,
      Coursemology::Polyglot::Language::TypeScript::TypeScript5Point8
    ].freeze

  KODITSU_WHITELIST =
    [
      Coursemology::Polyglot::Language::CPlusPlus::CPlusPlus11,
      Coursemology::Polyglot::Language::Python::Python3Point4,
      Coursemology::Polyglot::Language::Python::Python3Point5,
      Coursemology::Polyglot::Language::Python::Python3Point6,
      Coursemology::Polyglot::Language::Python::Python3Point7,
      Coursemology::Polyglot::Language::Python::Python3Point9,
      Coursemology::Polyglot::Language::Python::Python3Point10,
      Coursemology::Polyglot::Language::Python::Python3Point12,
      Coursemology::Polyglot::Language::Python::Python3Point13
    ].freeze

  DEPRECATED_LANGUAGES =
    [
      Coursemology::Polyglot::Language::Python::Python2Point7,
      Coursemology::Polyglot::Language::Python::Python3Point4,
      Coursemology::Polyglot::Language::Python::Python3Point5,
      Coursemology::Polyglot::Language::JavaScript,
      Coursemology::Polyglot::Language::CPlusPlus
    ].freeze

  EVALUATOR_UNSUPPORTED_LANGUAGES =
    [
      Coursemology::Polyglot::Language::JavaScript,
      Coursemology::Polyglot::Language::CPlusPlus,
      Coursemology::Polyglot::Language::R::R4Point1,
      Coursemology::Polyglot::Language::JavaScript::JavaScript22,
      Coursemology::Polyglot::Language::CSharp::CSharp5Point0,
      Coursemology::Polyglot::Language::Go::Go1Point16,
      Coursemology::Polyglot::Language::Rust::Rust1Point68,
      Coursemology::Polyglot::Language::TypeScript::TypeScript5Point8
    ].freeze

  task set_polyglot_language_flags: :environment do
    # this ensures all languages are loaded in the database table before flags are updated below
    Coursemology::Polyglot::Language.load_languages

    ActsAsTenant.without_tenant do
      Coursemology::Polyglot::Language.
        where(type: CODAVERI_EVALUATOR_WHITELIST.map(&:name)).
        update_all(codaveri_evaluator_whitelisted: true)
      Coursemology::Polyglot::Language.
        where.not(type: CODAVERI_EVALUATOR_WHITELIST.map(&:name)).
        update_all(codaveri_evaluator_whitelisted: false)

      Coursemology::Polyglot::Language.
        where(type: QUESTION_GENERATION_WHITELIST.map(&:name)).
        update_all(question_generation_whitelisted: true)
      Coursemology::Polyglot::Language.
        where.not(type: QUESTION_GENERATION_WHITELIST.map(&:name)).
        update_all(question_generation_whitelisted: false)

      Coursemology::Polyglot::Language.
        where(type: KODITSU_WHITELIST.map(&:name)).
        update_all(koditsu_whitelisted: true)
      Coursemology::Polyglot::Language.
        where.not(type: KODITSU_WHITELIST.map(&:name)).
        update_all(koditsu_whitelisted: false)

      Coursemology::Polyglot::Language.
        where(type: DEPRECATED_LANGUAGES.map(&:name)).
        update_all(enabled: false)
      Coursemology::Polyglot::Language.
        where.not(type: DEPRECATED_LANGUAGES.map(&:name)).
        update_all(enabled: true)

      Coursemology::Polyglot::Language.
        where(type: EVALUATOR_UNSUPPORTED_LANGUAGES.map(&:name)).
        update_all(default_evaluator_whitelisted: false)
      Coursemology::Polyglot::Language.
        where.not(type: EVALUATOR_UNSUPPORTED_LANGUAGES.map(&:name)).
        update_all(default_evaluator_whitelisted: true)
    end
  end
end
