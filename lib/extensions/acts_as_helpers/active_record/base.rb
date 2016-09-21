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

    # The description to be displayed in the 'reason' column for the experience points record on
    # the experience points history page.
    # This method is meant to be overridden by each class that acts as an experience points record.
    #
    # @return [String] Reason which will be displayed
    def experience_points_display_reason
      raise NotImplementedError,
            'Experience points awarding items need to implement a points_display_reason method'
    end

    # The parameters which will be resolved to the URL that the displayed reason links to on
    # the experience points history page.
    # This method is meant to be overridden by each class that acts as an experience points record.
    #
    # @return [Array|Object] The resource to link to
    # @return [String] The path to link to
    # @return [nil] If there is no link
    def experience_points_reason_url_params
      raise NotImplementedError,
            'Experience points awarding items need to implement the method '\
            'experience_points_reason_url_params'
    end
  end
end
