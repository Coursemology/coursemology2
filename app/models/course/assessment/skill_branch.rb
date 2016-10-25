# frozen_string_literal: true
class Course::Assessment::SkillBranch < ActiveRecord::Base
  acts_as_duplicable

  belongs_to :course, inverse_of: :assessment_skill_branches
  has_many :skills, inverse_of: :skill_branch
  scope :ordered_by_title, -> { order(:title) }

  def initialize_duplicate(duplicator, other)
    self.course = duplicator.duplicate(other.course)
    self.skills = duplicator.duplicate(other.skills)
  end
end
