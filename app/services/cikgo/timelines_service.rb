# frozen_string_literal: true
class Cikgo::TimelinesService < Cikgo::Service
  class << self
    def items(course_user)
      connection(:get, 'timelines', query: {
        pushKey: push_key(course_user.course),
        userId: cikgo_user_id(course_user)
      })
    end

    def update_time(course_user, story_id, start_at)
      connection(:patch, 'timelines', body: {
        pushKey: push_key(course_user.course),
        userId: cikgo_user_id(course_user),
        items: [{
          storyId: story_id,
          startAt: start_at
        }]
      })
    end

    private

    def cikgo_user_id(course_user)
      course_user.user.cikgo_user.provided_user_id
    end
  end
end
