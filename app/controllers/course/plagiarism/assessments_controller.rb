# frozen_string_literal: true
class Course::Plagiarism::AssessmentsController < Course::Plagiarism::Controller
  include Course::UsersHelper
  include Course::Statistics::CountsConcern
  include Course::Assessment::DuplicationTreeConcern

  PLAGIARISM_CHECK_QUERY_INTERVAL = 4.seconds
  PLAGIARISM_CHECK_START_TIMEOUT = 10.minutes

  def index
    @assessments = current_course.assessments.
                   includes(:plagiarism_check, :linked_assessments).
                   published.ordered_by_date_and_title
    @all_students = current_course.course_users.students

    fetch_all_assessment_related_statistics_hash
  end

  def plagiarism_data
    main_assessment = current_course.assessments.find(plagiarism_data_params[:id])
    @plagiarism_check = main_assessment.plagiarism_check || main_assessment.build_plagiarism_check
    query_and_update_plagiarism_check(main_assessment) if should_query_plagiarism_check?(main_assessment)
    timeout_plagiarism_check(main_assessment) if should_timeout_plagiarism_check?(main_assessment)

    if @plagiarism_check.completed?
      @course_users_hash = main_assessment.all_linked_assessments.to_h do |assessment|
        [assessment.course_id, preload_course_users_hash(assessment.course)]
      end
      service = Course::Assessment::Submission::SsidPlagiarismService.new(current_course, main_assessment)
      @results = service.fetch_plagiarism_result(
        plagiarism_data_params[:limit],
        plagiarism_data_params[:offset]
      ).compact
      fetch_can_manage_course_hash(get_all_assessments_in_duplication_tree(main_assessment))
    else
      @results = []
    end
  end

  def plagiarism_check
    assessment = current_course.assessments.find(params[:id])
    plagiarism_check = assessment.plagiarism_check || assessment.create_plagiarism_check

    unless plagiarism_check.starting? || plagiarism_check.running?
      Course::Assessment::PlagiarismCheckJob.perform_later(current_course, assessment).tap do |job|
        plagiarism_check.update!(job_id: job.job_id, workflow_state: :starting, last_started_at: Time.current)
      end
    end

    render partial: 'plagiarism_check', locals: { plagiarism_check: plagiarism_check }
  end

  def plagiarism_checks
    assessment_ids = params[:assessment_ids]
    assessments = current_course.assessments.includes(plagiarism_check: :job).where(id: assessment_ids)

    assessments.each do |assessment|
      plagiarism_check = assessment.plagiarism_check || assessment.create_plagiarism_check
      next if plagiarism_check.starting? || plagiarism_check.running?

      Course::Assessment::PlagiarismCheckJob.perform_later(current_course, assessment).tap do |job|
        plagiarism_check.update!(job_id: job.job_id, workflow_state: :starting, last_started_at: Time.current)
      end.job
    end

    render partial: 'plagiarism_checks', locals: {
      plagiarism_checks: assessments.map(&:plagiarism_check).compact
    }, status: :accepted
  end

  def fetch_plagiarism_checks
    all_assessments = current_course.assessments.includes(:plagiarism_check)

    # don't send another query to SSID if we recently queried
    assessments_to_query = all_assessments.select { |assessment| should_query_plagiarism_check?(assessment) }
    assessments_to_query.each { |assessment| query_and_update_plagiarism_check(assessment) }

    assessments_to_timeout = all_assessments.select { |assessment| should_timeout_plagiarism_check?(assessment) }
    assessments_to_timeout.each { |assessment| timeout_plagiarism_check(assessment) }

    render partial: 'plagiarism_checks', locals: {
      plagiarism_checks: all_assessments.map(&:plagiarism_check).compact
    }
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

  def plagiarism_data_params
    params.permit(:id, :limit, :offset)
  end

  def should_timeout_plagiarism_check?(assessment)
    return false if assessment.plagiarism_check.nil?

    assessment.plagiarism_check.starting? &&
      assessment.plagiarism_check.updated_at <= (Time.current - PLAGIARISM_CHECK_START_TIMEOUT)
  end

  def should_query_plagiarism_check?(assessment)
    return false if assessment.plagiarism_check.nil?

    assessment.plagiarism_check.running? &&
      assessment.plagiarism_check.updated_at <= (Time.current - PLAGIARISM_CHECK_QUERY_INTERVAL)
  end

  def timeout_plagiarism_check(assessment)
    assessment.plagiarism_check.update!(workflow_state: :failed)
  end

  def query_and_update_plagiarism_check(assessment)
    service = Course::Assessment::Submission::SsidPlagiarismService.new(current_course, assessment)
    response = service.fetch_plagiarism_check_result
    case response['status']
    when 'successful'
      assessment.plagiarism_check.update!(workflow_state: :completed)
    when 'failed'
      assessment.plagiarism_check.update!(workflow_state: :failed)
    else
      # Explicitly update to cover cases such as scan initiated from SSID side,
      # or scan was initiated on SSID but transaction rolled back from our side
      assessment.plagiarism_check.update!(workflow_state: :running, updated_at: Time.current)
    end
  end

  def fetch_all_assessment_related_statistics_hash
    @num_submitted_students_hash = num_submitted_students_hash
    @latest_submission_time_hash = latest_submission_time_hash
  end

  def fetch_can_manage_course_hash(assessments)
    course_users = CourseUser.includes(:course).where(
      user_id: current_user.id,
      course_id: assessments.map(&:course_id).uniq
    ).index_by(&:course_id)
    admin_instance_ids = current_user.instance_users.administrator.pluck(:instance_id)
    course_ids = assessments.map(&:course_id).uniq
    @can_manage_course_hash = course_ids.map do |course_id|
      [
        course_id,
        current_user.administrator? || # System admin
          (
            !course_users[course_id]&.course&.instance_id.nil? &&
              admin_instance_ids.include?(course_users[course_id]&.course&.instance_id)
          ) || # Instance admin
          course_users[course_id]&.manager_or_owner?
      ]
    end.to_h
  end
end
