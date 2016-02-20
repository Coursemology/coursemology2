# frozen_string_literal: true
class Course::Assessment::SkillBranch < ActiveRecord::Base
  belongs_to :course, inverse_of: :assessment_skill_branches
  has_many :skills, inverse_of: :skill_branch
end
