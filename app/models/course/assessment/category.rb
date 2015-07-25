# Represents a category of assessments. This is typically 'Mission' and 'Training'.
class Course::Assessment::Category < ActiveRecord::Base
  belongs_to :course, inverse_of: :assessment_categories
  has_many :tabs, class_name: Course::Assessment::Tab.name,
                  inverse_of: :category,
                  dependent: :destroy
  has_many :assessments, through: :tabs

  accepts_nested_attributes_for :tabs

  before_destroy :validate_before_destroy

  default_scope { order(:weight) }

  # Returns a boolean value indicating if there are other categories
  # besides this one remaining in its course.
  #
  # @return [Boolean]
  def other_categories_remaining?
    course.assessment_categories.count > 1
  end

  private

  def validate_before_destroy
    safe = other_categories_remaining?
    errors.add(:base, :deletion) unless safe
    safe
  end
end
