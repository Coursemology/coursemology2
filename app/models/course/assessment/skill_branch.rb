# frozen_string_literal: true
class Course::Assessment::SkillBranch < ActiveRecord::Base
  has_many :skills, inverse_of: :skill_branch
end
