# frozen_string_literal: true
class System::Admin::GetHelpController < System::Admin::Controller
  before_action :load_users

  def index
    start_date = params[:start_date].presence
    end_date = params[:end_date].presence
    @get_help_data = fetch_all_recent_live_feedbacks(start_date, end_date)
    load_assessment_question_hash
    load_course_user_hash
  end

  private

  def load_users
    @users = User.human_users.includes(:emails).active_in_past_7_days
    @user_hash = @users.index_by(&:id)
  end

  def load_course_user_hash
    # Get all unique course IDs from the assessment data
    course_ids = @assessment_question_hash.values.map { |v| v[:course_id] }.uniq

    @course_user_hash = {}
    course_ids.each do |course_id|
      course_users = CourseUser.where(course_id: course_id, user_id: @user_hash.keys)
      @course_user_hash[course_id] = course_users.index_by(&:user_id)
    end
  end

  def fetch_all_recent_live_feedbacks(start_date = nil, end_date = nil)
    date_conditions = []
    date_conditions << if start_date
                         "m.created_at >= '#{start_date} 00:00:00'"
                       else
                         "m.created_at >= NOW() - INTERVAL '7 days'"
                       end
    date_conditions << "m.created_at <= '#{end_date} 23:59:59'" if end_date
    date_sql = date_conditions.join(' AND ')

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
      WHERE t.submission_creator_id IN (#{@user_hash.keys.join(',')})
        AND m.creator_id != #{User::SYSTEM_USER_ID}
        AND #{date_sql}
      ORDER BY t.submission_creator_id, s.assessment_id, sq.question_id, m.created_at DESC
    SQL

    get_help_data.sort_by(&:created_at).reverse
  end

  def load_assessment_question_hash
    assessments = Course::Assessment.includes(:course, :question_assessments, :questions)
    question_hash = assessments.flat_map(&:questions).index_by(&:id)

    @assessment_question_hash =
      assessments.each_with_object({}) do |assessment, hash|
        course = assessment.course
        assessment.question_assessments.each do |qa|
          hash[[assessment.id, qa.question_id]] = {
            question_number: qa.question_number,
            question_title: question_hash[qa.question_id]&.title,
            assessment_title: assessment.title,
            course_id: course.id,
            course_title: course.title
          }
        end
      end
  end
end
