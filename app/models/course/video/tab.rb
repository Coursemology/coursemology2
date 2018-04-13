# frozen_string_literal: true
class Course::Video::Tab < ApplicationRecord
  include Course::ModelComponentHost::Component

  belongs_to :course, class_name: Course.name, inverse_of: :video_tabs
  has_many :videos, class_name: Course::Video.name, inverse_of: :tab, dependent: :destroy

  before_destroy :validate_before_destroy

  default_scope { order(:weight) }

  def self.after_course_initialize(course)
    return if course.persisted? || !course.video_tabs.empty?

    course.video_tabs.
      build(title: human_attribute_name('title.default'), weight: 0)
  end

  # Returns a boolean value indicating if there are other video tabs
  # besides this one remaining in the course.
  #
  # @return [Boolean]
  def other_tabs_remaining?
    course.video_tabs.count > 1
  end

  def initialize_duplicate(duplicator, other)
    self.course = duplicator.options[:destination_course]
    other.videos.each do |video|
      videos << duplicator.duplicate(video) if duplicator.duplicated?(video)
    end
  end

  private

  def validate_before_destroy
    return true if course.destroying? || other_tabs_remaining?
    errors.add(:base, :deletion)
    throw(:abort)
  end
end
