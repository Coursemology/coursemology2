# frozen_string_literal: true
module Extensions::HasManyInverseThrough::ActiveRecord::Associations::Builder::HasMany
  module ClassMethods
    def valid_options(options)
      [:inverse_through] + super
    end
  end
end
