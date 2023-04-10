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
    respond_to do |format|
      format.json
    end
  end

  def show_errored_job
    respond_to do |format|
      format.json
    end
  end

  def show_submitted_job
    respond_to do |format|
      format.json
    end
  end
end
