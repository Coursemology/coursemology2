# frozen_string_literal: true
class Course::Assessment::RubricsController < Course::Assessment::QuestionsController
  def index
    if @question.rubrics.empty? && @question.actable_type == Course::Assessment::Question::RubricBasedResponse.name
      v2_rubric = Course::Rubric.build_from_v1(@question.specific, current_course)
      v2_rubric.save!
    end

    @rubrics = @question.rubrics.includes({ categories: :criterions })
  end
end
