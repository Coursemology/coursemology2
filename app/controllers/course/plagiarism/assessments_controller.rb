# frozen_string_literal: true
class Course::Plagiarism::AssessmentsController < Course::Plagiarism::Controller
  include Course::UsersHelper
  include Course::Statistics::CountsConcern

  def index
    @assessments = current_course.assessments.includes(:plagiarism_check).published.ordered_by_date_and_title
    @all_students = current_course.course_users.students

    fetch_all_assessment_related_statistics_hash
  end

  def plagiarism_data
    @assessment = current_course.assessments.find(params[:assessment_id])
    @course_users_hash = preload_course_users_hash(current_course)
    @plagiarism_check = @assessment.plagiarism_check || @assessment.build_plagiarism_check

    if @plagiarism_check.completed?
      service = Course::Assessment::Submission::SsidPlagiarismService.new(current_course, @assessment)
      @results = service.fetch_plagiarism_result
    else
      @results = []
    end
  end

  def plagiarism_check
    assessment = current_course.assessments.find(params[:assessment_id])
    plagiarism_check = assessment.plagiarism_check || assessment.create_plagiarism_check

    plagiarism_job = Course::Assessment::PlagiarismCheckJob.perform_later(current_course, assessment).tap do |job|
      plagiarism_check.update!(job_id: job.job_id, workflow_state: :running, last_started_at: Time.current)
    end.job

    render partial: 'jobs/submitted', locals: { job: plagiarism_job }
  end

  def plagiarism_checks
    assessment_ids = params[:assessment_ids]
    assessments = current_course.assessments.where(id: assessment_ids)

    assessments.each do |assessment|
      plagiarism_check = assessment.plagiarism_check || assessment.create_plagiarism_check
      next if plagiarism_check.running?

      Course::Assessment::PlagiarismCheckJob.perform_later(current_course, assessment).tap do |job|
        plagiarism_check.update!(job_id: job.job_id, workflow_state: :running, last_started_at: Time.current)
      end.job
    end

    head :accepted
  end

  def download_submission_pair_result
    assessment = current_course.assessments.find(params[:assessment_id])
    submission_pair_id = params[:submission_pair_id]
    service = Course::Assessment::Submission::SsidPlagiarismService.new(current_course, assessment)
    render json: { html: service.download_submission_pair_result(submission_pair_id).html_safe }
  end

  def share_submission_pair_result
    assessment = current_course.assessments.find(params[:assessment_id])
    submission_pair_id = params[:submission_pair_id]
    service = Course::Assessment::Submission::SsidPlagiarismService.new(current_course, assessment)
    render json: { url: service.share_submission_pair_result(submission_pair_id) }
  end

  def share_assessment_result
    assessment = current_course.assessments.find(params[:assessment_id])
    service = Course::Assessment::Submission::SsidPlagiarismService.new(current_course, assessment)
    render json: { url: service.share_assessment_result }
  end

  private

  def fetch_all_assessment_related_statistics_hash
    @num_submitted_students_hash = num_submitted_students_hash
    @latest_submission_time_hash = latest_submission_time_hash
  end
end
