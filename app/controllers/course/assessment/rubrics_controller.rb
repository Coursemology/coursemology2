# frozen_string_literal: true
class Course::Assessment::RubricsController < Course::Assessment::QuestionsController
  load_resource :rubric, class: 'Course::Rubric', through: :question, only: [:show, :answer_evaluations, :mock_answer_evaluations]

  def index
    if @question.rubrics.empty? && @question.actable_type == Course::Assessment::Question::RubricBasedResponse.name
      v2_rubric = Course::Rubric.build_from_v1(@question.specific, current_course)
      v2_rubric.save!
    end

    @rubrics = @question.rubrics.includes({ categories: :criterions })
  end

  def show
    render partial: 'course/rubrics/rubric', locals: { rubric: @rubric }
  end

  def rubric_answers
    @answers = @question.answers.without_attempting_state.includes({ submission: { creator: :course_users} })
  end

  def answer_evaluations
    head :ok
  end

  def mock_answer_evaluations
    head :ok
  end
end
