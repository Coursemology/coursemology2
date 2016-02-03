# frozen_string_literal: true
module Extensions::HasManyInverseThrough::ActiveRecord::Associations::Builder::HasMany
  module PrependMethods
    def valid_options
      [:inverse_through] + super
    end
  end
end
