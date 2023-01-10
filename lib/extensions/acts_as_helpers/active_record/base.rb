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
    # Todo acts as reminders for students to act on. Todos are also automatically created
    #   when the lesson_plan_item transits from draft to non-draft, and destroyed in the
    #   reverse case (see Course::LessonPlan::ItemTodoConcern).
    #
    # has_todo is now an instance variable (added as a column in the course_lesson_plan_items),
    # instead of class variable.
    #
    # To declare that an actable model has todos:
    #   - Define has_todo as true when calling acts_as_lesson_plan_item
    #   - If an item's todo is customizable, add has_todo option to the frontend
    #   - Define hooks to update todo's workflow_state (see Course::LessonPlan::Todo)
    #   - For additional logic on whether a user can start an item, overwrite #can_user_start?
    #       in the actable model.
    #   - Implement two view partials for the actable model for display in the course landing page.
    #     app/views/course/lesson_plan/todos/_todo.json.jbuilder
    def acts_as_lesson_plan_item(has_todo: false)
      acts_as :lesson_plan_item, class_name: Course::LessonPlan::Item.name, autosave: true

      after_initialize do
        handle_todo_default(has_todo) if new_record?
      end

      scope :active, (lambda do
        joins(lesson_plan_item: :default_reference_time).merge(Course::ReferenceTime.currently_active)
      end)

      include LessonPlanItemInstanceMethods
      include LessonPlanItemPrivateMethods
    end
  end

  module ExperiencePointsInstanceMethods
    def manually_awarded?
      false
    end
  end

  module LessonPlanItemInstanceMethods
    def can_user_start?(_user = nil)
      true
    end

    # Override in the actable item if there's a need to check its settings component.
    #
    # @param event [String] The event to check for. e.g. 'opening', 'closing'.
    # @return [Boolean]
    def include_in_consolidated_email?(_event)
      false
    end
  end

  module LessonPlanItemPrivateMethods
    private

    def handle_todo_default(has_todo)
      lesson_plan_item.has_todo ||= has_todo if lesson_plan_item.has_todo.nil?
    end
  end
end
