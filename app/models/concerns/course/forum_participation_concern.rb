# frozen_string_literal: true
module Course::ForumParticipationConcern
  extend ActiveSupport::Concern

  module ClassMethods
    def forum_posts
      joins(:topic).where('course_discussion_topics.actable_type = ?', Course::Forum::Topic.name)
    end

    def from_course(course)
      joins(:topic).where('course_discussion_topics.course_id = ?', course.id)
    end
  end
end
