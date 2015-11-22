# An abstract language. This is an ActiveRecord class for other models to reference to a family of
# languages. Languages become concrete and can be referenced in the database when that language
# implements +Polyglot::Language.instance+.
#
# In addition as being an entity which can be referenced in the database, this also adds the
# scripts and stylesheets needed to syntax highlight code in languages defined here.
#
# Each subclass represents a language ancestry, such as differing language versions (see the Python
# language definition.) Each concrete language has a unique +Polyglot::Language.instance+ which
# is internally called the +root+ of the language. Derived languages can be defined at runtime to
# utilise the syntax highlighting capabilities of the root language, while requiring a separate
# runtime environment to run programs written in the derived language.
#
# Do *NOT* remove languages after they have been defined because a database record corresponds to
# a class implemented here.
class Polyglot::Language < ActiveRecord::Base
  extend ActiveSupport::Autoload

  self.table_name = 'polyglot_languages'
  acts_as_forest

  # Eager load all languages defined in the language directory.
  Dir["#{__dir__}/language/*"].each { |language| require language }

  after_initialize :set_readonly
  after_save :set_readonly

  validate :unique_root_language, unless: :parent

  # @!method self.instance
  #   Gets an instance of the language object. Any class which implements this method can be
  #   instantiated and is expected to no longer be abstract.
  #
  #   @abstract
  #   @return [Polyglot::Language]

  # Gets the display name of the language.
  #
  # @abstract
  # @return [String]
  def self.display_name
    fail NotImplementedError
  end

  # The stylesheets that need to be packaged with the rest of the application.
  #
  # This should include the Rouge/Pygments stylesheet for formatting code.
  #
  # @abstract
  # @return [Array<String>]
  def self.stylesheets
    fail NotImplementedError
  end

  # The script files that need to be packaged with the rest of the application.
  #
  # This should include the Ace mode for the language.
  #
  # @abstract
  # @return [Array<String>]
  def self.javascript
    fail NotImplementedError
  end

  # Finds or creates the root instance for languages of this class.
  #
  # @return [Polyglot::Language]
  def self.root
    # Creating the root record would call +root+, so if we are defining @root, we return nil.
    if instance_variable_defined?(:@root)
      @root
    else
      @root = nil
      @root = find_or_create_by(name: display_name, parent: nil)
    end
  end
  private_class_method :root

  # Loads or creates the database records for each defined programming language.
  def self.load_languages
    descendants.each do |klass|
      klass.instance if klass.respond_to?(:instance)
    end
  end

  private

  # Sets the record as readonly if this is the root record
  def set_readonly
    readonly! if persisted? && !parent
  end

  # Ensures that only one of each type of language has no parent.
  def unique_root_language
    errors.add(:parent, :taken) if self.class.send(:root)
  end
end
