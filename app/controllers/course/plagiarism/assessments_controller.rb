# frozen_string_literal: true
class Course::Plagiarism::AssessmentsController < Course::Plagiarism::Controller
  include Course::UsersHelper
  include Course::Statistics::CountsConcern
  include Course::Assessment::DuplicationTreeConcern

  def index
    @assessments = current_course.assessments.
                   includes(:plagiarism_check, :linked_assessments).
                   published.ordered_by_date_and_title
    @all_students = current_course.course_users.students

    fetch_all_assessment_related_statistics_hash
  end

  def plagiarism_data
    main_assessment = current_course.assessments.find(params[:id])
    @course_users_hash = main_assessment.all_linked_assessments.to_h do |assessment|
      [assessment.course_id, preload_course_users_hash(assessment.course)]
    end
    @plagiarism_check = main_assessment.plagiarism_check || main_assessment.build_plagiarism_check

    if @plagiarism_check.completed?
      service = Course::Assessment::Submission::SsidPlagiarismService.new(current_course, main_assessment)
      @results = service.fetch_plagiarism_result
      fetch_can_manage_course_hash(get_all_assessments_in_duplication_tree(main_assessment))
    else
      @results = []
    end
  end

  def plagiarism_check
    assessment = current_course.assessments.find(params[:id])
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
    assessment = current_course.assessments.find(params[:id])
    submission_pair_id = params[:submission_pair_id]
    service = Course::Assessment::Submission::SsidPlagiarismService.new(current_course, assessment)
    render json: { html: service.download_submission_pair_result(submission_pair_id).html_safe }
  end

  def share_submission_pair_result
    assessment = current_course.assessments.find(params[:id])
    submission_pair_id = params[:submission_pair_id]
    service = Course::Assessment::Submission::SsidPlagiarismService.new(current_course, assessment)
    render json: { url: service.share_submission_pair_result(submission_pair_id) }
  end

  def share_assessment_result
    assessment = current_course.assessments.find(params[:id])
    service = Course::Assessment::Submission::SsidPlagiarismService.new(current_course, assessment)
    render json: { url: service.share_assessment_result }
  end

  def linked_and_unlinked_assessments
    assessment = current_course.assessments.find(params[:id])
    # TODO: properly handle cases for assessments in different instances.
    all_assessments = get_all_assessments_in_duplication_tree(assessment).reject { |a| a.course.nil? }
    fetch_can_manage_course_hash(all_assessments)
    @linked_assessments = assessment.all_linked_assessments.reject { |a| a.course.nil? }
    @unlinked_assessments = all_assessments - @linked_assessments
  end

  def update_assessment_links
    assessment = current_course.assessments.find(params[:id])
    linked_assessment_ids = params[:linked_assessment_ids].map(&:to_i)
    assessment.linked_assessment_ids = linked_assessment_ids
    assessment.save!

    head :ok
  end

  private

  def fetch_all_assessment_related_statistics_hash
    @num_submitted_students_hash = num_submitted_students_hash
    @latest_submission_time_hash = latest_submission_time_hash
  end

  def fetch_can_manage_course_hash(assessments)
    course_users = CourseUser.where(
      user_id: current_user.id,
      course_id: assessments.map(&:course_id).uniq
    ).index_by(&:course_id)
    courses = assessments.map(&:course).uniq
    @can_manage_course_hash = courses.to_h do |course|
      [
        course.id,
        course_users[course.id]&.manager_or_owner?
      ]
    end
  end
end
