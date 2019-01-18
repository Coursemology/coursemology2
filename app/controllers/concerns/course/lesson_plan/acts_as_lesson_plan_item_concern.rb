# frozen_string_literal: true
module Course::LessonPlan::ActsAsLessonPlanItemConcern
  extend ActiveSupport::Concern

  module ClassMethods
    # Use method to build new specific lesson_plan_items
    # Refer to app/controllers/course/assessment/question/controller.rb for motivation
    def build_and_authorize_new_lesson_plan_item(item_name, options)
      before_action only: options[:only], except: options[:except] do
        specific_item = options[:class].new
        specific_item.lesson_plan_item.course = @course
        if action_name != 'new'
          item_params = send("#{item_name}_params")
          specific_item.assign_attributes(item_params.except(:item))
        end
        authorize!(action_name.to_sym, specific_item)
        instance_variable_set("@#{item_name}", specific_item) unless instance_variable_get("@#{item_name}")
      end
    end
  end
end
