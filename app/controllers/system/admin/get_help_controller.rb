# frozen_string_literal: true
class System::Admin::GetHelpController < System::Admin::Controller
  def index
    ActsAsTenant.without_tenant do
      start_date, end_date = sanitize_date_range(params[:start_at], params[:end_at])

      unless valid_date_range?(start_date, end_date)
        return render json: { error: 'Invalid date range' }, status: :bad_request
      end

      @get_help_data = fetch_all_recent_live_feedbacks(start_date, end_date)

      user_ids = @get_help_data.map(&:submission_creator_id).uniq
      assessment_ids = @get_help_data.map(&:assessment_id).uniq

      load_assessment_and_course_hash(assessment_ids)
      load_course_instance_hash
      load_course_user_hash(user_ids)
    end
  end

  private

  def sanitize_date_range(start_at_param, end_at_param)
    start_date_str = start_at_param.presence || (Time.current - 7.days).iso8601
    end_date_str = end_at_param.presence || Time.current.iso8601
    [Date.parse(start_date_str).beginning_of_day, Date.parse(end_date_str).end_of_day]
  end

  def valid_date_range?(start_date, end_date)
    return true unless start_date.present? && end_date.present?

    start_date <= end_date && (end_date.to_date - start_date.to_date).to_i <= 365
  end

  def load_course_user_hash(user_ids)
    course_users = CourseUser.where(course_id: @course_instance_hash.keys, user_id: user_ids)
    @course_user_hash = course_users.group_by(&:course_id).transform_values do |users|
      users.index_by(&:user_id)
    end
  end

  def fetch_all_recent_live_feedbacks(start_date, end_date)
    get_help_data = Course::Assessment::LiveFeedback::Message.find_by_sql(<<-SQL)
      SELECT DISTINCT ON (t.submission_creator_id, s.assessment_id, sq.question_id)
        m.id, m.content, m.created_at, t.submission_creator_id,
        s.assessment_id, sq.submission_id, sq.question_id,
        COUNT(*) OVER (
          PARTITION BY t.submission_creator_id, s.assessment_id, sq.question_id
        ) AS message_count
      FROM live_feedback_messages m
      INNER JOIN live_feedback_threads t ON m.thread_id = t.id
      INNER JOIN course_assessment_submission_questions sq ON t.submission_question_id = sq.id
      INNER JOIN course_assessment_submissions s ON sq.submission_id = s.id
      WHERE m.creator_id != #{User::SYSTEM_USER_ID}
        AND m.created_at >= '#{start_date.utc.iso8601}'
        AND m.created_at <= '#{end_date.utc.iso8601}'
      ORDER BY t.submission_creator_id, s.assessment_id, sq.question_id, m.created_at DESC
    SQL

    get_help_data.sort_by(&:created_at).reverse
  end

  def load_assessment_and_course_hash(assessment_ids)
    @assessments = Course::Assessment.
                   includes(:course, :question_assessments, :questions).
                   where(id: assessment_ids)
    question_hash = @assessments.flat_map(&:questions).index_by(&:id)

    @assessment_question_hash =
      @assessments.each_with_object({}) do |assessment, hash|
        course = assessment.course
        assessment.question_assessments.each do |qa|
          hash[[assessment.id, qa.question_id]] = build_question_hash(assessment, qa, course, question_hash)
        end
      end
  end

  def load_course_instance_hash
    @course_instance_hash = @assessments.to_h { |a| [a.course.id, a.course.instance_id] }
    instances = Instance.where(id: @course_instance_hash.values.uniq).index_by(&:id)

    @course_instance_hash = @course_instance_hash.transform_values do |instance_id|
      instance = instances[instance_id]
      {
        instance_id: instance_id,
        instance_title: instance&.name,
        instance_host: instance&.host
      }
    end
  end

  def build_question_hash(assessment, question_assessment, course, question_hash)
    {
      question_number: question_assessment.question_number,
      question_title: question_hash[question_assessment.question_id]&.title,
      assessment_title: assessment.title,
      course_id: course.id,
      course_title: course.title
    }
  end
end
