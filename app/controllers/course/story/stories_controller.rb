# frozen_string_literal: true
class Course::Story::StoriesController < Course::Story::Controller
  before_action :preload_lesson_plan_items, only: [:index]

  def index
  end

  def show
    @has_rooms = @story.rooms.exists?
  end

  def new
  end

  private

  def preload_lesson_plan_items
    @items_hash = @course.lesson_plan_items.where(actable_id: @stories.pluck(:id), actable_type: Course::Story.name).
                  preload(actable: :conditions).
                  with_reference_times_for(current_course_user).
                  with_personal_times_for(current_course_user).
                  to_h do |item|
      [item.actable_id, item]
    end
  end
end
