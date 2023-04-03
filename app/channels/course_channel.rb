# frozen_string_literal: true
#
# The base channel for all `Course`-related channels. Subclasses of this channel
# must receive `course_id` as a parameter in the subscription request message.
#
# By default, it will expose, in chronological order:
# - `current_tenant`
# - `current_course`
# - `current_course_user`
class CourseChannel < ApplicationCable::Channel
  include ApplicationCableMultitenancyConcern
  include ApplicationCableCourseConcern
end
