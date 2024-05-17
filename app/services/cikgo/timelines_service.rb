# frozen_string_literal: true
class Cikgo::TimelinesService < Cikgo::Service
  class << self
    include Cikgo::CourseConcern

    def items!(course_user)
      connection(:get, 'timelines', query: {
        pushKey: push_key(course_user.course),
        userId: cikgo_user_id(course_user)
      })
    end

    def update_time!(course_user, story_id, start_at)
      connection(:patch, 'timelines', body: {
        pushKey: push_key(course_user.course),
        userId: cikgo_user_id(course_user),
        items: [{
          storyId: story_id,
          startAt: start_at
        }]
      })
    end

    def delete_times!(course_user, story_ids)
      connection(:delete, 'timelines', body: {
        pushKey: push_key(course_user.course),
        userId: cikgo_user_id(course_user),
        storyIds: story_ids
      })
    end
  end
end
