# frozen_string_literal: true
class Course::Plagiarism::AssessmentsController < Course::Plagiarism::Controller
  include Course::UsersHelper
  include Course::Statistics::CountsConcern

  PLAGIARISM_CHECK_QUERY_INTERVAL = 4.seconds
  PLAGIARISM_CHECK_START_TIMEOUT = 10.minutes

  def index
    @assessments = current_course.assessments.
                   includes(:plagiarism_check).
                   published.ordered_by_date_and_title
    @linked_assessment_counts_hash = Course::Assessment::Link.
                                     where(assessment_id: @assessments.pluck(:id)).
                                     where.not('assessment_id = linked_assessment_id').
                                     group(:assessment_id).count
    @all_students = current_course.course_users.students

    fetch_all_assessment_related_statistics_hash
  end

  def plagiarism_data
    main_assessment = current_course.assessments.find(plagiarism_data_params[:id])
    @plagiarism_check = main_assessment.plagiarism_check || main_assessment.build_plagiarism_check
    query_and_update_plagiarism_check(main_assessment) if should_query_plagiarism_check?(main_assessment)
    timeout_plagiarism_check(main_assessment) if should_timeout_plagiarism_check?(main_assessment)

    if @plagiarism_check.completed?
      service = Course::Assessment::Submission::SsidPlagiarismService.new(current_course, main_assessment)
      @results = service.fetch_plagiarism_result(
        plagiarism_data_params[:limit],
        plagiarism_data_params[:offset]
      ).compact
      submission_ids = (
        @results.map { |row| row[:base_submission_id] } +
        @results.map { |row| row[:compared_submission_id] }
      ).uniq
      submissions = fetch_plagiarism_data_submissions(submission_ids)
      @submissions_hash = submissions.index_by(&:id)
      @can_manage_submissions_hash = fetch_can_manage_rows_hash(submissions)
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

    linkable_assessments = Course::Assessment.find_by_sql(<<~SQL.squish
      SELECT
        ca.id,
        clpi.title AS title,
        c.id AS course_id,
        c.title AS course_title,
        cu.id AS viewer_course_user_id,
        al.id AS link_id

      FROM course_assessments ca
      INNER JOIN course_lesson_plan_items clpi ON clpi.actable_id = ca.id AND clpi.actable_type = 'Course::Assessment'
      INNER JOIN course_assessment_tabs tab ON ca.tab_id = tab.id
      INNER JOIN course_assessment_categories cat ON tab.category_id = cat.id
      INNER JOIN courses c ON cat.course_id = c.id
      LEFT OUTER JOIN course_users cu ON cu.course_id = c.id AND cu.user_id = #{current_user.id}
      LEFT OUTER JOIN course_assessment_links al ON al.assessment_id = #{assessment.id} AND al.linked_assessment_id = ca.id
      WHERE c.instance_id = #{current_tenant.id} AND
        (ca.linkable_tree_id = #{assessment.linkable_tree_id} OR al.id IS NOT NULL)
    SQL
                                                         )

    @unlinked_assessments, @linked_assessments = linkable_assessments.partition do |row|
      row.link_id.nil? && row.id != assessment.id
    end
    @can_manage_assessment_hash = fetch_can_manage_rows_hash(linkable_assessments)
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

  def fetch_plagiarism_data_submissions(submission_ids)
    return [] if submission_ids.empty?

    Course::Assessment::Submission.find_by_sql(<<~SQL.squish
      SELECT
        cas.id,
        ca.id AS assessment_id,
        clpi.title AS assessment_title,
        c.id AS course_id,
        c.title AS course_title,
        cas.creator_id,
        ccu.id AS creator_course_user_id,
        ccu.name AS creator_course_user_name,
        vcu.id AS viewer_course_user_id
      FROM course_assessment_submissions cas
      INNER JOIN course_assessments ca ON cas.assessment_id = ca.id
      INNER JOIN course_lesson_plan_items clpi ON clpi.actable_id = ca.id AND clpi.actable_type = 'Course::Assessment'
      INNER JOIN course_assessment_tabs tab ON ca.tab_id = tab.id
      INNER JOIN course_assessment_categories cat ON tab.category_id = cat.id
      INNER JOIN courses c ON cat.course_id = c.id
      INNER JOIN course_users ccu ON ccu.course_id = c.id AND ccu.user_id = cas.creator_id
      LEFT OUTER JOIN course_users vcu ON vcu.course_id = c.id AND vcu.user_id = #{current_user.id}
      WHERE cas.id IN (#{submission_ids.join(', ')})
    SQL
                                              )
  end

  def fetch_all_assessment_related_statistics_hash
    @num_submitted_students_hash = num_submitted_students_hash
    @latest_submission_time_hash = latest_submission_time_hash
    @num_plagiarism_checkable_questions_hash = num_plagiarism_checkable_questions_hash
  end

  def fetch_can_manage_rows_hash(rows)
    return {} if rows.empty?

    is_administrator = viewer_is_administrator?
    return rows.to_h { |row| [row.id, true] } if is_administrator

    course_users = CourseUser.where(
      id: rows.map(&:viewer_course_user_id).compact.uniq
    ).index_by(&:id)
    rows.to_h do |row|
      [
        row.id,
        course_users[row.viewer_course_user_id]&.manager_or_owner?
      ]
    end
  end

  def viewer_is_administrator?
    current_user.administrator? || # System admin
      current_user.instance_users.administrator.pluck(:instance_id).include?(current_tenant.id) # Instance admin
  end

  def num_plagiarism_checkable_questions_hash
    Course::QuestionAssessment.
      unscoped.
      joins(:question).
      where(assessment: @assessments).
      merge(Course::Assessment::Question.plagiarism_checkable).
      group(:assessment_id).
      count
  end
end
