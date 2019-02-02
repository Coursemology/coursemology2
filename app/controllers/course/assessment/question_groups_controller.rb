# frozen_string_literal: true
class Course::Assessment::QuestionGroupsController < Course::Assessment::Controller
  load_and_authorize_resource :question_group, class: Course::Assessment::QuestionGroup, through: :assessment
  before_action :add_breadcrumbs

  def index
    @question_groups = @question_groups.order(:weight)
  end

  def new
  end

  def create
    if @question_group.save
      redirect_to course_assessment_question_groups_path(current_course, @assessment)
    else
      render 'new'
    end
  end

  def edit
  end

  def update
    if @question_group.update(question_group_params)
      redirect_to course_assessment_question_groups_path(current_course, @assessment)
    else
      render 'edit'
    end
  end

  def destroy
    if @question_group.destroy
      redirect_to course_assessment_question_groups_path(current_course, @assessment)
    else
      redirect_to course_assessment_question_groups_path(current_course, @assessment),
                  danger: @question_group.errors.full_messages.to_sentence
    end
  end

  private

  def add_breadcrumbs
    add_breadcrumb(@assessment.title, course_assessment_path(current_course, @assessment))
    add_breadcrumb('Question Groups', course_assessment_question_groups_path(current_course, @assessment))
  end

  def question_group_params
    params.require(:question_group).permit(:title, :weight)
  end
end
