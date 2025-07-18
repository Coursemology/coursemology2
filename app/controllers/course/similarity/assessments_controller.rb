# frozen_string_literal: true
class Course::Similarity::AssessmentsController < Course::Similarity::Controller
  include Course::UsersHelper
  include Course::Statistics::CountsConcern

  def index
    @assessments = current_course.assessments.includes(:similarity_check).published.ordered_by_date_and_title
    @all_students = current_course.course_users.students

    fetch_all_assessment_related_statistics_hash
  end

  def similarity_data
    @assessment = current_course.assessments.find(params[:assessment_id])
    @course_users_hash = preload_course_users_hash(current_course)
    @similarity_check = @assessment.similarity_check || @assessment.build_similarity_check

    if @similarity_check.completed?
      service = Course::Assessment::Submission::SsidSimilarityService.new(current_course, @assessment)
      @results = service.fetch_similarity_result
    else
      @results = []
    end
  end

  def similarity_check
    assessment = current_course.assessments.find(params[:assessment_id])
    similarity_check = assessment.similarity_check || assessment.create_similarity_check

    similarity_job = Course::Assessment::SimilarityCheckJob.perform_later(current_course, assessment).tap do |job|
      similarity_check.update!(job_id: job.job_id, workflow_state: :running, last_started_at: Time.current)
    end.job

    render partial: 'jobs/submitted', locals: { job: similarity_job }
  end

  def similarity_checks
    assessment_ids = params[:assessment_ids]
    assessments = current_course.assessments.where(id: assessment_ids)

    assessments.each do |assessment|
      similarity_check = assessment.similarity_check || assessment.create_similarity_check
      next if similarity_check.running?

      Course::Assessment::SimilarityCheckJob.perform_later(current_course, assessment).tap do |job|
        similarity_check.update!(job_id: job.job_id, workflow_state: :running, last_started_at: Time.current)
      end.job
    end

    head :accepted
  end

  def download_submission_pair_result
    assessment = current_course.assessments.find(params[:assessment_id])
    submission_pair_id = params[:submission_pair_id]
    service = Course::Assessment::Submission::SsidSimilarityService.new(current_course, assessment)
    render json: { html: service.download_submission_pair_result(submission_pair_id).html_safe }
  end

  def share_submission_pair_result
    assessment = current_course.assessments.find(params[:assessment_id])
    submission_pair_id = params[:submission_pair_id]
    service = Course::Assessment::Submission::SsidSimilarityService.new(current_course, assessment)
    render json: { url: service.share_submission_pair_result(submission_pair_id) }
  end

  def share_assessment_result
    assessment = current_course.assessments.find(params[:assessment_id])
    service = Course::Assessment::Submission::SsidSimilarityService.new(current_course, assessment)
    render json: { url: service.share_assessment_result }
  end

  private

  def fetch_all_assessment_related_statistics_hash
    @num_submitted_students_hash = num_submitted_students_hash
    @latest_submission_time_hash = latest_submission_time_hash
  end
end
