# frozen_string_literal: true
# This extends +Coursemology::Polyglot::Language+ to support integration into a database.
#
# Each concrete language has a unique +Polyglot::Language.instance+ which is internally called the
# +root_instance+ of the language.
#
# Do *NOT* remove languages after they have been defined because a database record corresponds to
# a class implemented here.
module Extensions::PolyglotWithDatabase::Coursemology::Polyglot::Language
  extend ActiveSupport::Concern

  included do
    self.table_name = 'polyglot_languages'
    acts_as_forest optional: true

    after_initialize :set_readonly
    after_save :set_readonly

    validate :unique_root_language, unless: :parent

    # @!method self.with_language(languages)
    #   Gets all languages in the given set.
    #
    #   @param [Array<String>] languages
    scope :with_language, (lambda do |languages|
      if languages.blank?
        all
      else
        where(name: languages)
      end
    end)
  end

  module ClassMethods
    # Loads or creates the database records for each defined programming language.
    def load_languages
      concrete_languages.each(&:instance)
    end

    # The valid upgrade targets for every language, keyed by language id, computed in a single pass.
    #
    # Rendering a page of programming questions would otherwise call +upgrade_targets+ once per row,
    # and each call reloads the whole table through +family_siblings+.
    #
    # @param [Array<Coursemology::Polyglot::Language>] languages Pass an already-loaded collection to
    #   avoid re-reading the table when the caller needs it for other things too.
    # @return [Hash{Integer => Array<Coursemology::Polyglot::Language>}]
    def upgrade_targets_by_language_id(languages = all.to_a)
      languages.group_by(&:polyglot_name).flat_map do |_, family|
        targets = enabled_newest_first(family)
        family.map { |language| [language.id, targets] }
      end.to_h
    end

    # @param [Array<Coursemology::Polyglot::Language>] languages
    # @return [Array<Coursemology::Polyglot::Language>] The non-deprecated ones, newest first.
    def enabled_newest_first(languages)
      languages.select(&:enabled).sort_by(&:comparable_polyglot_version).reverse
    end

    private

    # Finds or creates the root instance for languages of this class.
    #
    # @return [Coursemology::Polyglot::Language]
    def root_instance
      # Creating the root record would call +root_instance+, so if we are defining @root, we return
      # nil.
      if instance_variable_defined?(:@root_instance)
        @root_instance
      else
        @root_instance = nil
        @root_instance = find_or_create_by(name: display_name, parent: nil)
      end
    end
  end

  # Language version as an integer array, for numeric (not lexicographic) comparison.
  #
  # String comparison gets this wrong: '2.10' < '2.9' as strings, but [2, 10] > [2, 9].
  # Version-less languages (the legacy 'C/C++' and 'JavaScript' rows) yield [], which sorts first.
  #
  # @return [Array<Integer>]
  def comparable_polyglot_version
    polyglot_version&.split('.')&.map(&:to_i) || []
  end

  # Every language in the same family, including self. A family is all versions sharing a
  # +polyglot_name+ ('Python 3.13' and 'Python 3.14' are both 'python').
  #
  # Note this is derived at runtime rather than read off +parent_id+ (NULL on every row) or +weight+
  # (a serial assigned by a manually-run rake task, so live values drift from the intended order).
  # The table holds a couple of dozen rows, so loading it is cheaper than the indirection.
  #
  # @return [Array<Coursemology::Polyglot::Language>]
  def family_siblings
    Coursemology::Polyglot::Language.all.select { |language| language.polyglot_name == polyglot_name }
  end

  # Non-deprecated languages in the same family, newest first. These are the valid targets when
  # migrating a question off its current language.
  #
  # Use +.upgrade_targets_by_language_id+ instead when resolving targets for many languages at once.
  #
  # @return [Array<Coursemology::Polyglot::Language>]
  def upgrade_targets
    self.class.enabled_newest_first(family_siblings)
  end

  # The newest non-deprecated language in the same family.
  #
  # Deliberately filters on +enabled+, unlike +latest?+ in db:set_polyglot_language_weights. Today
  # the newest member of every family happens to be non-deprecated, so the two agree, but relying on
  # that would break silently the day a newest version is deprecated.
  #
  # @return [Coursemology::Polyglot::Language, nil] nil if every language in the family is deprecated.
  def latest_in_family
    upgrade_targets.first
  end

  # Whether this language has been retired and can no longer be assigned to a question.
  #
  # @return [Boolean]
  def deprecated?
    !enabled
  end

  # Whether a question on this language should be moved to a different version.
  #
  # True when a newer non-deprecated version exists. Also true when this language is itself
  # deprecated and any non-deprecated sibling is available — in that case the target may be a *lower*
  # version, which is intended: a deprecated language has to be migrated off regardless of direction.
  #
  # @return [Boolean]
  def upgradable?
    latest = latest_in_family
    latest.present? && latest != self
  end

  private

  # Sets the record as readonly if this is the root record
  def set_readonly
    readonly! if persisted? && !parent
  end

  # Ensures that only one of each type of language has no parent.
  def unique_root_language
    errors.add(:parent, :taken) if self.class.send(:root_instance)
  end
end

module Coursemology::Polyglot::ConcreteLanguage
  # Returns language name in lowercase format (eg python, java).
  #
  # @return [String] The language name in lowercase format.
  def polyglot_name
    name.split[0].downcase
  end

  # Returns language version.
  #
  # @return [String] The language version.
  def polyglot_version
    name.split[1]
  end

  # This directly injects a method into all concrete languages' class methods.
  module ClassMethods
    def instance
      root_instance
    end
  end
end
