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
      acts_as :condition, class_name: Course::Condition.name

      include ConditionInstanceMethods
      extend ConditionClassMethods
    end
  end

  module ConditionalInstanceMethods
    def specific_conditions
      conditions.map(&:actable)
    end

    # Check if all conditions are satisfied by the user.
    #
    # @param [CourseUser] course_user The user that conditions are being checked on
    # @return [Boolean] true if all conditions are met and false otherwise
    def conditions_satisfied_by?(course_user)
      conditions.all? { |condition| condition.satisfied_by?(course_user) }
    end

    # @return [Array<Condition] Conditions that are satisfied when this conditional is resolved
    def satisfy_conditions
      fail NotImplementedError
    end
  end

  module ConditionInstanceMethods
    # A human-readable name for each condition; usually just wraps a title
    # or name field. Meant to be used in a polymorphic manner for views.
    def title
      fail NotImplementedError
    end

    # @return [Array<Object] Conditional objects that the condition depends on to check
    #   if it is satisfiable
    def dependent_objects
      fail NotImplementedError
    end

    # Checks if the condition is satisfied by the user.
    #
    # @param [CourseUser] _user The user that the condition is being checked on
    # @return [Boolean] true if the condition is met and false otherwise
    def satisfied_by?(_user)
      fail NotImplementedError
    end
  end

  module ConditionClassMethods
    # Array of classes that the condition depends on.
    def dependent_classes
      fail NotImplementedError
    end
  end
end
