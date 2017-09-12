# frozen_string_literal: true
class Course::Video::Topic < ActiveRecord::Base
  acts_as_discussion_topic

  belongs_to :video, inverse_of: :topics

  after_initialize :set_course, if: :new_record?

  private

  # Set the course as the same course of the lesson plan item.
  def set_course
    self.course ||= video.lesson_plan_item.course if video
  end
end
