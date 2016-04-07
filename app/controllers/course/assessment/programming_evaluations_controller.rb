# frozen_string_literal: true
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
  around_action :load_and_authorize_pending_programming_evaluation, only: [:allocate]
  load_resource :programming_evaluation, class: Course::Assessment::ProgrammingEvaluation.name
  before_action :load_programming_evaluation, only: [:package, :update_result]
  authorize_resource :programming_evaluation, class: Course::Assessment::ProgrammingEvaluation.name,
                                              except: [:allocate, :package]

  def allocate
    save_success = @programming_evaluations.
                   each { |evaluation| evaluation.assign!(current_user) }.
                   map(&:save)
    response.status = :bad_request unless save_success.all?
  end

  def show
  end

  def package
    authorize! :show, @programming_evaluation
    redirect_to @programming_evaluation.package_path
  end

  def update_result
    raise IllegalStateError unless @programming_evaluation.assigned?
    @programming_evaluation.assign_attributes(update_result_params)
    @programming_evaluation.complete!
    if @programming_evaluation.save
      render json: {}, status: :ok
    else
      response.status = :bad_request
    end
  end

  private

  def language_param
    params.permit(language: [])[:language]
  end

  def id_param
    params.permit(:programming_evaluation_id)[:programming_evaluation_id]
  end

  def update_result_params
    params.require(:programming_evaluation).permit(:stdout, :stderr, :test_report, :exit_code)
  end

  def unscope_course
    Course.unscoped { yield }
  end

  def load_and_authorize_pending_programming_evaluation
    Course::Assessment::ProgrammingEvaluation.transaction do
      @programming_evaluations ||= [].tap do |evaluations|
        programming_evaluation = find_pending_programming_evaluation
        evaluations << programming_evaluation if programming_evaluation
      end

      yield
    end
  rescue IllegalStateError
    retry
  end

  def load_programming_evaluation
    @programming_evaluation ||= Course::Assessment::ProgrammingEvaluation.find(id_param)
  end

  # Obtains a programming evaluation task accessible by and suitable for the current user.
  #
  # This uses two database queries -- the first to shortlist, the second to lock. Ideally, this
  # should be one atomic operation, but Postgres does not support row-level locking when used
  # with DISTINCT.
  #
  # @raise [IllegalStateError] If the retrieved record is already assigned to another evaluator
  #   when locking. The caller should retry finding another evaluation, in that case.
  # @return [Course::Assessment::ProgrammingEvaluation] The programming evaluation.
  # @return [nil] If no evaluations are found.
  def find_pending_programming_evaluation
    evaluation = Course::Assessment::ProgrammingEvaluation.
                 accessible_by(current_ability, :show).
                 with_language(language_param).
                 pending.take
    return nil unless evaluation

    evaluation = evaluation.lock!
    raise IllegalStateError unless evaluation.pending?

    evaluation
  end
end
