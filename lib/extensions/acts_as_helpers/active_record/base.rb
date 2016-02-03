# frozen_string_literal: true
module Extensions::ActsAsHelpers::ActiveRecord::Base
  module ClassMethods
    # Decorator for items that give course_users EXP Points
    def acts_as_experience_points_record
      acts_as :experience_points_record, class_name: Course::ExperiencePointsRecord.name
      include ExperiencePointsInstanceMethods
    end

    # Decorator for abstractions with concrete occurrences which have
    # the potential to award course_users EXP Points
    def acts_as_lesson_plan_item
      acts_as :lesson_plan_item, class_name: Course::LessonPlan::Item.name
    end
  end

  module ExperiencePointsInstanceMethods
    def manually_awarded?
      false
    end
  end
end
