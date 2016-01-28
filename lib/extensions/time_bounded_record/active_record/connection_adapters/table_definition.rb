# frozen_string_literal: true
module Extensions::TimeBoundedRecord::ActiveRecord::ConnectionAdapters::TableDefinition
  # Enforces a date range for the given table.
  #
  # @see ActiveRecord::Base#currently_active? for more details.
  def time_bounded(*args)
    datetime :start_at, *args
    datetime :end_at, *args
  end
end
