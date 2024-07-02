# frozen_string_literal: true
class DuplicationTraceable::Course < ApplicationRecord
  acts_as_duplication_traceable

  validates :course, presence: true
  belongs_to :course, class_name: 'Course', inverse_of: :duplication_traceable

  # Class that the duplication traceable depends on.
  def self.dependent_class
    'Course'
  end

  def self.initialize_with_dest(dest, **options)
    new(course: dest, **options)
  end
end
