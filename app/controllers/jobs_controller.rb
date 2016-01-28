# frozen_string_literal: true
class JobsController < ApplicationController
  before_action :load_job

  def show
    if @job.completed?
      show_completed_job
    elsif @job.errored?
      show_errored_job
    else
      show_submitted_job
    end
  end

  protected

  def publicly_accessible?
    true
  end

  private

  def load_job
    @job ||= TrackableJob::Job.find(params[:id])
  end

  def show_completed_job
    redirect_to @job.redirect_to if @job.redirect_to.present?
  end

  def show_errored_job
    if @job.redirect_to.present?
      redirect_to @job.redirect_to
    else
      response.status = :internal_server_error
    end
  end

  def show_submitted_job
    response.status = :accepted
  end
end
