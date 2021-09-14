# frozen_string_literal: true
module Course::Video::VideosHelper
  def display_video_tabs
    return nil if current_course.video_tabs.count == 1

    tabs do
      current_course.video_tabs.each do |tab|
        concat(nav_to(format_inline_text(tab.title),
                      course_videos_path(current_course, tab: tab)))
      end
    end
  end
end
