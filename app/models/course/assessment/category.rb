# frozen_string_literal: true
# Represents a category of assessments. This is typically 'Mission' and 'Training'.
class Course::Assessment::Category < ApplicationRecord
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
    self.folder = duplicator.duplicate(other.folder)
    self.course = duplicator.options[:target_course]
    tabs << other.tabs.select { |tab| duplicator.duplicated?(tab) }.map do |tab|
      duplicator.duplicate(tab).tap do |duplicate_tab|
        duplicate_tab.assessments.each { |assessment| assessment.folder.parent = folder }
      end
    end
  end

  # @return [Boolean] true if post-duplication processing is successful.
  def after_duplicate_save(duplicator)
    User.with_stamper(duplicator.options[:current_user]) do
      build_initial_tab ? save : true
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
