# frozen_string_literal: true
module Course::LessonPlan::StoriesConcern
  extend ActiveSupport::Concern

  def delete_all_future_stories_personal_times(course_user)
    future_story_ids = stories_for(course_user).filter_map do |story|
      story.id if story.personal_time_for(course_user) && story.submitted_at.blank?
    end

    return if future_story_ids.blank?

    Cikgo::TimelinesService.delete_times!(course_user, future_story_ids)
  rescue StandardError => e
    Rails.logger.error("Cikgo: Cannot delete personal times for story IDs #{future_story_ids}: #{e}")
    raise e unless Rails.env.production?
  end

  private

  def stories_for(course_user)
    @stories_for ||= Course::Story.for_course_user!(course_user) || []
  rescue StandardError => e
    Rails.logger.error("Cannot fetch stories for course user #{course_user.id}: #{e}")
    raise e unless Rails.env.production?

    []
  end
end
