# frozen_string_literal: true
module Extensions::HasManyInverseThrough::ActiveRecord::Associations::HasManyThroughAssociation
  module PrependMethods
    def build_through_record(record)
      association = reflection.inverse_through
      through_record = record.public_send(association.name) if association
      through_record || super
    end
  end
end
