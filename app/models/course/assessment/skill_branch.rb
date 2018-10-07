# frozen_string_literal: true
class Course::Assessment::SkillBranch < ApplicationRecord
  validates_length_of :title, allow_nil: true, maximum: 255
  validates_presence_of :title
  validates_presence_of :creator
  validates_presence_of :updater
  validates_presence_of :course

  belongs_to :course, inverse_of: :assessment_skill_branches
  has_many :skills, inverse_of: :skill_branch

  scope :ordered_by_title, -> { order(:title) }

  def initialize_duplicate(duplicator, other)
    self.course = duplicator.options[:destination_course]
    skills << other.skills.
              select { |skill| duplicator.duplicated?(skill) }.
              map { |skill| duplicator.duplicate(skill) }
  end
end
