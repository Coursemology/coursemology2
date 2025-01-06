# frozen_string_literal: true
namespace :db do
  # This rake updates the weight column in the polyglot_languages table,
  # changing the order in which languages are displayed in drop-down menus.

  def comparable_polyglot_version(language)
    language&.polyglot_version&.split('.')&.map(&:to_i)
  end

  def version_compare(lang1, lang2)
    comparable_polyglot_version(lang1) <=> comparable_polyglot_version(lang2)
  end

  # to be populated once we query the languages
  @latest_hash = {}
  def latest?(language)
    @latest_hash.key?(language.name)
  end

  def language_compare(lang1, lang2) # rubocop:disable Metrics/CyclomaticComplexity
    # Put more recent versions first
    return -version_compare(lang1, lang2) if lang1.polyglot_name == lang2.polyglot_name

    # Put latest versions of each language before outdated versions of all languages
    return -1 if latest?(lang1) && !latest?(lang2)
    return 1 if !latest?(lang1) && latest?(lang2)

    # At this point we know that:
    # - both languages are different and
    # - the languages are either both latest? = true or both latest? = false.
    # Now polyglot_name can be safely used to determine the ordering now.
    lang1.polyglot_name <=> lang2.polyglot_name
  end

  task set_polyglot_language_weights: :environment do
    # this ensures all languages are loaded in the database table before flags are updated below
    Coursemology::Polyglot::Language.load_languages
    @all_languages = Coursemology::Polyglot::Language.all
    @all_languages.group_by(&:polyglot_name).each_value do |languages|
      @latest_hash[languages.sort(&method(:version_compare)).last.name] = true
    end

    ActsAsTenant.without_tenant do
      ActiveRecord::Base.connection.execute(
        'ALTER SEQUENCE polyglot_languages_weight_seq RESTART WITH 1;'
      )
      # The highest weight is displayed first, so we perform assignments in reverse order
      @all_languages.sort(&method(:language_compare)).reverse_each do |language|
        ActiveRecord::Base.connection.execute(
          "UPDATE polyglot_languages SET weight = nextval('polyglot_languages_weight_seq') WHERE name = '#{language.name}';" # rubocop:disable Layout/LineLength
        )
      end
    end
  end
end
