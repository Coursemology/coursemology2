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
  end
end
