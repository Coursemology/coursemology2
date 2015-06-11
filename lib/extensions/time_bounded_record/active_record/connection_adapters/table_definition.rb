module Extensions::TimeBoundedRecord::ActiveRecord::ConnectionAdapters::TableDefinition
  # Enforces a valid date range for the given table.
  #
  # @see ActiveRecord::Base#currently_valid? for more details.
  def time_bounded(*args)
    datetime :valid_from, *args
    datetime :valid_to, *args
  end
end
