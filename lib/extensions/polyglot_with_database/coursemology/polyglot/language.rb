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
      if !languages || languages.empty?
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

# This directly injects a method into all concrete languages' class methods.
module Coursemology::Polyglot::ConcreteLanguage::ClassMethods
  def instance
    root_instance
  end
end
