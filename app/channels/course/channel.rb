# frozen_string_literal: true
#
# The base channel for all `Course`-related channels. Subclasses of this channel
# must receive `course_id` as a parameter in the subscription request message.
#
# By default, it will expose, in chronological order:
# - `current_course`
# - `current_course_user`
# - `current_component_host`
# - `current_ability`
# - `can?` and `cannot?` from `CanCan::Ability`
#
# Note that the more inclusions are added, the more queries and operations are executed
# during subscriptions or actions, depending on the callbacks used in each included modules.
# These features are broken up into concerns so that future channels can opt in to only the
# capabilities they need.
class Course::Channel < ApplicationCable::Channel
  include ApplicationCableCourseConcern
  include ApplicationCableComponentConcern
  include ApplicationCableAbilityConcern
end
