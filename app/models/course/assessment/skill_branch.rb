# frozen_string_literal: true
class Course::Assessment::SkillBranch < ActiveRecord::Base
  belongs_to :course, inverse_of: :assessment_skill_branches
  has_many :skills, inverse_of: :skill_branch
  scope :ordered_by_title, -> { order(:title) }

  def initialize_duplicate(duplicator, other)
    if duplicator.mode == :course
      self.course = duplicator.duplicate(other.course)
      self.skills = duplicator.duplicate(other.skills)
    elsif duplicator.mode == :object
      self.course = duplicator.options[:target_course]
      self.skills << other.skills.
                     select { |skill| duplicator.duplicated?(skill) }.
                     map { |skill| duplicator.duplicate(skill) }
    end
  end
end
