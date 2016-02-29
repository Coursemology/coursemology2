# frozen_string_literal: true
class Course::Assessment::SkillsController < Course::ComponentController
  load_and_authorize_resource :skill, class: Course::Assessment::Skill.name, through: :course,
                                      through_association: :assessment_skills
  before_action :load_skill_branches
  add_breadcrumb :index, :course_assessments_skills_path

  def index
  end

  def new
  end

  def create
    if @skill.save
      redirect_to course_assessments_skills_path(current_course),
                  success: t('.success', title: @skill.title)
    else
      render 'new'
    end
  end

  def edit
  end

  def update
    if @skill.update_attributes(skill_params)
      redirect_to course_assessments_skills_path(current_course),
                  success: t('.success', title: @skill.title)
    else
      render 'edit'
    end
  end

  def destroy
    if @skill.destroy
      redirect_to course_assessments_skills_path(current_course),
                  success: t('.success', skill: @skill.title)
    else
      redirect_to course_assessments_skills_path(current_course),
                  danger: t('.failure', error: @skill.errors.full_messages.to_sentence)
    end
  end

  private

  def skill_params
    params.require(:skill).permit(:title, :description, :skill_branch_id)
  end

  def load_skill_branches
    @skill_branches = current_course.assessment_skill_branches.accessible_by(current_ability)
  end
end
