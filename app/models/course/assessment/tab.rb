# frozen_string_literal: true
class Course::Assessment::Tab < ActiveRecord::Base
  belongs_to :category, class_name: Course::Assessment::Category.name, inverse_of: :tabs
  has_many :assessments, class_name: Course::Assessment.name, dependent: :destroy, inverse_of: :tab

  before_destroy :validate_before_destroy

  default_scope { order(:weight) }

  # Returns a boolean value indicating if there are other tabs
  # besides this one remaining in its category.
  #
  # @return [Boolean]
  def other_tabs_remaining?
    category.tabs.count > 1
  end

  private

  def validate_before_destroy
    return true if category.destroying?
    safe = other_tabs_remaining?
    errors.add(:base, :deletion) unless safe
    safe
  end
end
