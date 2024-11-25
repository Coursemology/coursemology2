# frozen_string_literal: true
namespace :db do
  # This rake updates the weight column in the polyglot_languages table,
  # changing the order in which languages are displayed in drop-down menus.

  LANGUAGE_ORDERING = [
    'python',
    'java',
    'c/c++',
    'r',
    'javascript'
  ].freeze

  def version_compare(ver1, ver2)
    ver1&.split('.')&.map(&:to_i) <=> ver2&.split('.')&.map(&:to_i)
  end

  def language_compare(lang1, lang2)
    index1 = LANGUAGE_ORDERING.index { |l| lang1.polyglot_name == l }
    index2 = LANGUAGE_ORDERING.index { |l| lang2.polyglot_name == l }

    # Put most recent versions first
    return -version_compare(lang1.polyglot_version, lang2.polyglot_version) if index1 == index2
    return 1 if index1.nil?
    return -1 if index2.nil?

    index1 <=> index2
  end

  task set_polyglot_language_weights: :environment do
    # this ensures all languages are loaded in the database table before flags are updated below
    Coursemology::Polyglot::Language.load_languages

    ActsAsTenant.without_tenant do
      ActiveRecord::Base.connection.execute(
        'ALTER SEQUENCE polyglot_languages_weight_seq RESTART WITH 1;'
      )
      # The highest weight is displayed first, so we perform assignments in reverse order
      Coursemology::Polyglot::Language.all.sort(&method(:language_compare)).reverse_each do |lang|
        ActiveRecord::Base.connection.execute(
          "UPDATE polyglot_languages SET weight = nextval('polyglot_languages_weight_seq') WHERE name = '#{lang.name}';"
        )
      end
    end
  end
end
