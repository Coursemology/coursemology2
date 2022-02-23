# frozen_string_literal: true
class Course::LessonPlan::CoursewidePersonalizedTimelineUpdateJob < ApplicationJob
  include Course::LessonPlan::PersonalizationConcern
  queue_as :lowest

  protected

  def perform(lesson_plan_item)
    instance = Course.unscoped { lesson_plan_item.course.instance }
    ActsAsTenant.with_tenant(instance) do
      update_personalized_timeline_for_item(lesson_plan_item)
    end
  end
end
