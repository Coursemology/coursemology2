# Test group helpers for creating tables.
module ActiveRecord::Migration::TestGroupHelpers
  # Defines a temporary table that is instantiated when needed, within a `with_temporary_table`
  # block.
  #
  # @param [Symbol] table_name The name of the table to define.
  # @param [Proc] proc The table definition, same as that of a block given to
  #   +ActiveRecord::Migration::create_table+
  def temporary_table(table_name, &proc)
    define_method(table_name) do
      proc
    end
  end

  # Using the temporary table defined previously, run the examples in this group.
  #
  # @param [Symbol] table_name The name of the table to use.
  # @param [Proc] proc The examples requiring the use of the temporary table.
  def with_temporary_table(*table_names, &proc)
    context "with temporary table #{table_names}" do |*params|
      before(:context) do
        definitions = table_names.map { |name| [name, send(name)] }
        ActiveRecord::Migration::TestGroupHelpers.before_context(definitions)
      end

      after(:context) do
        ActiveRecord::Migration::TestGroupHelpers.after_context(table_names)
      end

      module_exec(*params, &proc)
    end
  end

  def self.before_context(table_definitions)
    ActiveRecord::Migration.suppress_messages do
      table_definitions.each do |(table_name, table_definition)|
        ActiveRecord::Migration.create_table(table_name, &table_definition)
      end
    end
  end

  def self.after_context(table_names)
    ActiveRecord::Migration.suppress_messages do
      table_names.reverse_each do |table_name|
        ActiveRecord::Migration.drop_table(table_name)
      end
    end
  end
end

RSpec.configure do |config|
  config.extend ActiveRecord::Migration::TestGroupHelpers, type: :model
end
