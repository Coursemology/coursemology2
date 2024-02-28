# frozen_string_literal: true
module Cikgo::PushableItemConcern
  extend ActiveSupport::Concern

  def pushable_lesson_plan_item_types
    [Course::Assessment, Course::Video, Course::Survey]
  end

  def pushable?(something)
    pushable_lesson_plan_item_types.include?(something.class)
  end
end
