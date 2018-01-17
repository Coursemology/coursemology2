# frozen_string_literal: true
module Extensions::ActsAsHelpers::ActiveRecord::Base
  module ClassMethods
    # Decorator for items that give course_users EXP Points
    def acts_as_experience_points_record
      acts_as :experience_points_record, class_name: Course::ExperiencePointsRecord.name
      include ExperiencePointsInstanceMethods
    end

    # Decorator for abstractions with concrete occurrences for student activities with a start
    #   and end date, with the option to: (i) Award course_users with EXP Points, and/or
    #   (ii) Appear as a todo item for each course_user once it is published
    #
    # Todo acts as reminders for sutdents to act on. Todos are also automatically created
    #   when the lesson_plan_item transits from draft to non-draft, and destroyed in the
    #   reverse case (see Course::LessonPlan::ItemTodoConcern).
    #
    # To declare that an actable model has todos:
    #   - Define has_todo as true when calling acts_as_lesson_plan_item
    #   - Define hooks to update todo's workflow_state (see Course::LessonPlan::Todo)
    #   - For additional logic on whether a user can start an item, overwrite #can_user_start?
    #       in the actable model.
    #   - Implement two view partials for the actable model for display in the course landing page.
    #     1) _todo_#{actable.class.name}_title.html.slim    -> Title and any links if required.
    #     2) _todo_#{actable.class.name}_button.html.slim   -> Action button for todo.
    def acts_as_lesson_plan_item(has_todo: false)
      acts_as :lesson_plan_item, class_name: Course::LessonPlan::Item.name

      class << self
        attr_accessor :has_todo
      end
      self.has_todo = has_todo ? true : false

      scope :active, -> { joins(:lesson_plan_item).merge(Course::LessonPlan::Item.currently_active) }

      extend LessonPlanItemClassMethods
      include LessonPlanItemInstanceMethods
    end
  end

  module ExperiencePointsInstanceMethods
    def manually_awarded?
      false
    end
  end

  module LessonPlanItemClassMethods
    def has_todo?
      has_todo
    end
  end

  module LessonPlanItemInstanceMethods
    def can_user_start?(_user = nil)
      true
    end
  end
end
