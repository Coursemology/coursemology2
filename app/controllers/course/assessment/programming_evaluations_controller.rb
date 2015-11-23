# The programming question evaluations controller.
#
# This does *NOT* inherit from the course/assessment controllers because this needs to query across
# courses and instances, depending on the user's access permissions.
#
# There is no access control for the user beyond the course. That is, if an evaluator is granted
# access to the course as an evaluator, he will be able to see all outstanding jobs and claim any
# of them.
class Course::Assessment::ProgrammingEvaluationsController < ApplicationController
  around_action :unscope_course
  before_action :load_programming_evaluation, only: [:update_result]
  before_action :set_request_format
  load_and_authorize_resource :programming_evaluations,
                              class: Course::Assessment::ProgrammingEvaluation.name

  def index
    @programming_evaluations = @programming_evaluations.with_language(language_param)
  end

  def update_result
    fail IllegalStateError unless @programming_evaluation.assigned?
    @programming_evaluation.assign_attributes(update_result_params)
    @programming_evaluation.complete!
    if @programming_evaluation.save
      render nothing: true, status: :ok
    else
      response.status = :bad_request
    end
  end

  private

  def unscope_course
    Course.unscoped { yield }
  end

  def load_programming_evaluation
    @programming_evaluation = Course::Assessment::ProgrammingEvaluation.find(id_param)
  end

  def set_request_format
    request.format = :json unless params.key?(:format)
  end

  def language_param
    params.permit(language: [])[:language]
  end

  def id_param
    params.permit(:programming_evaluation_id)[:programming_evaluation_id]
  end

  def update_result_params
    params.require(:programming_evaluation).permit(:stdout, :stderr, :test_report)
  end
end
