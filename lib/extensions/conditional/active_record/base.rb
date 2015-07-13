module Extensions::Conditional::ActiveRecord::Base
  module ClassMethods
    # Functions from conditional-and-condition framework.
    # Declare this function in the conditional model that requires conditions.
    def acts_as_conditional
      has_many :conditions, -> { includes :actable },
               class_name: Course::Condition.name, as: :conditional, dependent: :destroy,
               inverse_of: :conditional

      include ConditionalInstanceMethods
    end

    # Declare this function in the condition model
    def acts_as_condition
      acts_as :condition, class_name: Course::Condition.name, inverse_of: :actable
    end
  end

  module ConditionalInstanceMethods
    def specific_conditions
      conditions.map(&:actable)
    end
  end
end
