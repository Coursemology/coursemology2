# frozen_string_literal: true
class RegroupCourseSettings < ActiveRecord::Migration
  def settings_key_mapping
    @settings_key_mapping ||= {
      announcement: :course_announcements_component,
      forum: :course_forums_component,
      leaderboard: :course_leaderboard_component,
      material: :course_materials_component,
      video: :course_videos_component,
      virtual_classroom: :course_virtual_classrooms_component,
      discussion_topics: :course_discussion_topics_component
    }
  end

  def setting_keys
    @setting_keys ||= settings_key_mapping.keys
  end

  def change
    ActsAsTenant.without_tenant do
      Course.all.each do |course|
        # Update individual component keys
        setting_keys.map do |key|
          data = course.settings.public_send(key)
          if data
            course.settings.public_send("#{settings_key_mapping[key]}=", data)
            course.settings.public_send("#{key}=", nil)
          end
        end

        # Prune unused keys
        course.settings.lecture = nil
        course.settings(:components).course_lectures_component = nil

        course.save
      end
    end
  end
end
