# frozen_string_literal: true
# Represents a category of assessments. This is typically 'Mission' and 'Training'.
class Course::Assessment::Category < ActiveRecord::Base
  include Course::ModelComponentHost::Component
  has_one_folder

  belongs_to :course, inverse_of: :assessment_categories
  has_many :tabs, class_name: Course::Assessment::Tab.name,
                  inverse_of: :category,
                  dependent: :destroy
  has_many :assessments, through: :tabs

  accepts_nested_attributes_for :tabs

  after_initialize :build_initial_tab, if: :new_record?
  after_initialize :set_folder_start_at, if: :new_record?
  before_validation :assign_folder_attributes
  before_destroy :validate_before_destroy

  default_scope { order(:weight) }

  def self.after_course_initialize(course)
    return if course.persisted? || !course.assessment_categories.empty?

    course.assessment_categories.
      build(title: human_attribute_name('title.default'), weight: 0)
  end

  # Returns a boolean value indicating if there are other categories
  # besides this one remaining in its course.
  #
  # @return [Boolean]
  def other_categories_remaining?
    course.assessment_categories.count > 1
  end

  def initialize_duplicate(duplicator, other)
    # duplicate the folder (single object)
    self.folder = duplicator.duplicate(other.folder)

    if duplicator.mode == :course
      self.course = duplicator.duplicate(other.course)
      self.tabs = duplicator.duplicate(other.tabs).compact
    elsif duplicator.mode == :object
      self.course = duplicator.options[:target_course]
    end
  end

  private

  def build_initial_tab
    tabs.build(title: Course::Assessment::Tab.human_attribute_name('title.default'),
               weight: 0, category: self) if tabs.empty?
  end

  def set_folder_start_at
    folder.start_at = Time.zone.now
  end

  def assign_folder_attributes
    folder.assign_attributes(name: title, course: course, parent: course.root_folder)
  end

  def validate_before_destroy
    return true if course.destroying?
    safe = other_categories_remaining?
    errors.add(:base, :deletion) unless safe
    safe
  end
end
