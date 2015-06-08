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
  def with_temporary_table(table_name, &proc)
    context "with temporary table #{table_name}" do |*params|
      before(:context) do
        ActiveRecord::Migration::TestGroupHelpers.before_context(table_name, send(table_name))
      end

      after(:context) do
        ActiveRecord::Migration::TestGroupHelpers.after_context(table_name)
      end

      instance_exec(*params, &proc)
    end
  end

  def self.before_context(table_name, table_definition)
    ActiveRecord::Migration.suppress_messages do
      ActiveRecord::Migration.create_table(table_name, &table_definition)
    end
  end

  def self.after_context(table_name)
    ActiveRecord::Migration.suppress_messages do
      ActiveRecord::Migration.drop_table(table_name)
    end
  end
end

RSpec.configure do |config|
  config.extend ActiveRecord::Migration::TestGroupHelpers, type: :model
end
