# frozen_string_literal: true
module Extensions::DateTimeHelpers
  module TimeClassMethods
    def min
      utc(0)
    end

    def max
      utc(5000)
    end
  end
end
