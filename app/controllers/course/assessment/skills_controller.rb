# frozen_string_literal: true
class Course::Assessment::SkillsController < Course::ComponentController
  load_and_authorize_resource :skill, class: Course::Assessment::Skill.name, through: :course,
                                      through_association: :assessment_skills
  load_and_authorize_resource :skill_branch, class: Course::Assessment::SkillBranch.name,
                                             parent: false, through: :course,
                                             through_association: :assessment_skill_branches,
                                             only: :index
  add_breadcrumb :index, :course_assessments_skills_path

  def index
  end
end
