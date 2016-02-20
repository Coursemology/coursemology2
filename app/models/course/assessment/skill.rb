# frozen_string_literal: true
class Course::Assessment::Skill < ActiveRecord::Base
  belongs_to :course, inverse_of: :assessment_skills
  belongs_to :skill_branch, class_name: Course::Assessment::SkillBranch.name, inverse_of: :skills
  has_and_belongs_to_many :questions, class_name: Course::Assessment::Question.name
end
