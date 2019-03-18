# frozen_string_literal: true

require 'active_job'
require 'active_job/arguments'

# Patch for CVE-2018-16476
# TODO: remove after upgrade to rails 6
module ArgumentsNotDeserializingGlobalId
  def deserialize_argument(argument)
    case argument
    when String
      argument
    else
      super
    end
  end
end

ActiveJob::Arguments.singleton_class.prepend(ArgumentsNotDeserializingGlobalId)
