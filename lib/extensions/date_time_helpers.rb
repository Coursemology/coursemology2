module Extensions::DateTimeHelpers
  module TimeClassMethods
    def min
      at(-Float::MAX)
    end

    def max
      at(Float::MAX)
    end
  end
end
