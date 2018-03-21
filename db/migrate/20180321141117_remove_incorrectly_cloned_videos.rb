# frozen_string_literal: true
class RemoveIncorrectlyClonedVideos < ActiveRecord::Migration[5.1]
  def change
    Course::Video.
      joins(:tab).
      joins(:lesson_plan_item).
      where('course_video_tabs.course_id <> course_lesson_plan_items.course_id').
      destroy_all

    ActsAsTenant.without_tenant do
      Course.
        where('NOT EXISTS(SELECT 1 FROM course_video_tabs WHERE course_video_tabs.course_id = courses.id)').
        find_each do |course|
        
        course.video_tabs.create(title: 'Default', weight: 0,
                                 creator_id: course.creator.id, updater_id: course.creator.id)
      end
    end
  end
end
