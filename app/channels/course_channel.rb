# frozen_string_literal: true
#
# The base channel for all `Course`-related channels. Subclasses of this channel
# must receive `course_id` as a parameter in the subscription request message.
class CourseChannel < ApplicationCable::Channel
  include ApplicationCableMultitenancyConcern
end
