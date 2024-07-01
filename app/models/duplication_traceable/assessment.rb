# frozen_string_literal: true
class DuplicationTraceable::Assessment < ApplicationRecord
  acts_as_duplication_traceable

  validates :assessment, presence: true
  belongs_to :assessment, class_name: 'Course::Assessment', inverse_of: :duplication_traceable

  # Class that the duplication traceable depends on.
  def self.dependent_class
    'Course::Assessment'
  end

  def self.initialize_with_dest(dest, **options)
    new(assessment: dest, **options)
  end
end
