# frozen_string_literal: true
class Course::RubricsController < Course::Controller
  load_and_authorize_resource :rubric, through: :course, class: 'Course::Rubric'

  def index
    if index_params[:question_id].present?
      question = Course::Assessment::Question.find(index_params[:question_id])
      head :not_found and return if question.nil?

      if question.rubrics.empty? && question.actable_type == Course::Assessment::Question::RubricBasedResponse.name
        v2_rubric = Course::Rubric.build_from_v1(question.specific, current_course)
        p({ v2_rubric: v2_rubric, v2_rubric_categories: v2_rubric.categories })
        v2_rubric.save!
      end
      @rubrics = question.rubrics
    else
      @rubrics = current_course.rubrics
    end
  end

  def destroy
  end

  private

  def index_params
    params.permit(:question_id)
  end
end
