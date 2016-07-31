# frozen_string_literal: true
module Course::ForumParticipationConcern
  extend ActiveSupport::Concern

  module ClassMethods
    def forum_posts
      joins { topic }.where { topic.actable_type == Course::Forum::Topic }
    end

    def from_course(course)
      joins { topic }.where { topic.course_id == course.id }
    end
  end
end
