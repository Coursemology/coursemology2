# frozen_string_literal: true
class Course::Assessment::RubricsController < Course::Assessment::QuestionsController
  def index
    head :not_found and return unless @question.specific.is_a?(Course::Assessment::Question::RubricBasedResponse)

    if @question.rubrics.empty?
      v2_rubric = Course::Rubric.build_from_v1(@question.specific, current_course)
      v2_rubric.save!
    end

    @rubrics = @question.rubrics.includes({ categories: :criterions })
  end
end
