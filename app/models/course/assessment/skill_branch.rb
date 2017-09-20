# frozen_string_literal: true
class Course::Assessment::SkillBranch < ApplicationRecord
  belongs_to :course, inverse_of: :assessment_skill_branches
  has_many :skills, inverse_of: :skill_branch
  scope :ordered_by_title, -> { order(:title) }

  def initialize_duplicate(duplicator, other)
    self.course = duplicator.options[:target_course]
    skills << other.skills.
              select { |skill| duplicator.duplicated?(skill) }.
              map { |skill| duplicator.duplicate(skill) }
  end
end
