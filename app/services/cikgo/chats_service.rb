# frozen_string_literal: true
class Cikgo::ChatsService < Cikgo::Service
  class << self
    include Cikgo::CourseConcern

    def find_or_create_room!(course_user)
      result = connection(:post, 'chats', body: {
        pushKey: push_key(course_user.course),
        userId: cikgo_user_id(course_user),
        role: cikgo_role(course_user)
      })

      [result[:url], result[:openThreadsCount]]
    end

    def mission_control!(course_user)
      result = connection(:post, 'chats/manage', body: {
        pushKey: push_key(course_user.course),
        userId: cikgo_user_id(course_user)
      })

      [result[:url], result[:pendingThreadsCount]]
    end
  end
end
