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

      include ConditionInstanceMethods
    end
  end

  module ConditionalInstanceMethods
    def specific_conditions
      conditions.map(&:actable)
    end
  end

  module ConditionInstanceMethods
    # A human-readable name for each condition; usually just wraps a title
    # or name field. Meant to be used in a polymorphic manner for views.
    def title
      fail NotImplementedError
    end
  end
end
