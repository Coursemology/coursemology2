# frozen_string_literal: true
module Course::CikgoPushConcern
  extend ActiveSupport::Concern
  include Cikgo::PushableItemConcern

  private

  def push_lesson_plan_items_to_remote_course
    return unless current_course.component_enabled?(Course::StoriesComponent)

    Cikgo::ResourcesService.push_repository(
      current_course,
      course_url(current_course),
      pushable_lesson_plan_items.filter_map do |item|
        actable = item.actable
        kind = actable.class.name.demodulize

        {
          id: item.id.to_s,
          kind: kind,
          name: item.title,
          description: item.description,
          url: send("course_#{kind.underscore}_url", current_course, actable)
        }
      end
    )
  end

  def pushable_lesson_plan_items
    current_course.lesson_plan_items.published.includes(:actable).
      where(actable_type: pushable_lesson_plan_item_types.map(&:name))
  end
end
