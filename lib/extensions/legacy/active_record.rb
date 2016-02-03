# frozen_string_literal: true
module Extensions::Legacy::ActiveRecord; end

# Undoes rails/rails#14579.
#
# We need this because we rely on the fact that +string+ is used for short strings, and +text+ is
# used for longer strings (possibly those involving newlines). Most of these strings would be
# used in short messages, like flash messages, or other titles of objects, and we would not like
# these to be unreasonably long. Schema Plus Validations would add the length limit validations for
# us, when the database column contains the limits, so we stick with these limits.
ActiveRecord::ConnectionAdapters::PostgreSQLAdapter::NATIVE_DATABASE_TYPES[:string][:limit] = 255
