# frozen_string_literal: true
module Extensions::HasManyInverseThrough::ActiveRecord::Reflection::ThroughReflection
  module PrependMethods
    def self.prepended(module_)
      module_.class_eval do
        attr_accessor :inverse_through_name
      end
    end

    def initialize(delegate_reflection)
      super
      @inverse_through_name = delegate_reflection.options[:inverse_through]
    end
  end

  def inverse_through
    return unless inverse_through_name

    @inverse_through ||= klass._reflect_on_association(inverse_through_name)
  end
end
