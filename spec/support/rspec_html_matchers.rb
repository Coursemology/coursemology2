# frozen_string_literal: true
class RSpecHtmlMatchers::HaveTag
  module FrozenStringHelper
    def initialize(tag, *args)
      tag = tag.dup
      super
    end
  end

  prepend FrozenStringHelper
end
