module Extensions::Legacy::ActiveRecord::Base
  module ClassMethods
    # Decorator for items that give course_users EXP Points
    def acts_as_experience_points_record
      acts_as :experience_points_record, class_name: Course::ExperiencePointsRecord.name
      class_eval do
        def manual_exp?
          false
        end
      end
    end

    # Decorator for abstractions with concreate occurrences which have
    # the potential to award course_users EXP Points
    def acts_as_lesson_plan_item
      acts_as :lesson_plan_item, class_name: Course::LessonPlanItem.name
    end

    # Functions from conditional-and-condition framework.
    # Declare this function in the conditional model that requires conditions.
    def acts_as_conditional
      has_many :conditions, -> { includes :actable },
               class_name: Course::Condition.name, as: :conditional, dependent: :destroy

      include ConditionalInstanceMethods
    end

    # Declare this function in the condition model
    def acts_as_condition
      acts_as :condition, class_name: Course::Condition.name
    end
  end

  module ConditionalInstanceMethods
    def specific_conditions
      conditions.map(&:actable)
    end
  end
end
