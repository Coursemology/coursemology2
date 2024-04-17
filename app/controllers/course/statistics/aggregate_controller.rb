# frozen_string_literal: true
# This is named aggregate controller as naming this as course controller leads to name conflict issues
class Course::Statistics::AggregateController < Course::Statistics::Controller
  before_action :preload_levels, only: [:all_students, :course_performance]
  before_action :fetch_published_assessments, only: [:all_assessments, :submission_time]
  include Course::Statistics::TimesConcern
  include Course::Statistics::GradesConcern
  include Course::Statistics::CountsConcern
  include Course::Statistics::ReferenceTimesConcern

  def course_progression
    @assessment_info_array = assessment_info_array
    @user_submission_array = user_submission_array
  end

  def course_performance
    @students = course_users.students.ordered_by_experience_points.with_performance_statistics
    @correctness_hash = correctness_hash
    @service = group_manager_preload_service
  end

  def all_staff
    @staff = current_course.course_users.teaching_assistant_and_manager.includes(:group_users)
    @staff = CourseUser.order_by_average_marking_time(@staff)
  end

  def all_students
    @all_students = course_users.students.ordered_by_experience_points.with_video_statistics
    @service = group_manager_preload_service
  end

  def all_assessments
    @all_students = current_course.course_users.students
    @all_submissions_info = all_submissions_info

    fetch_all_assessment_related_statistics_hash
  end

  def submission_time
    @all_students = [CourseUser.where(id: params[:student_id]).first]
    @submissions = all_submissions_for_student_info
    @maximum_grade_hash = max_grade_statistics_hash

    fetch_assessment_timeline_hash
  end

  private

  def fetch_published_assessments
    @assessments = current_course.assessments.published.includes(tab: :category)
  end

  def all_submissions_info
    @all_submissions_info ||= ActiveRecord::Base.connection.execute("
      SELECT
        cu.id AS course_user_id,
        cas.id, cas.workflow_state, cas.creator_id,
        cas.created_at, cas.submitted_at, cas.assessment_id,
        SUM(caa.grade) AS grade
      FROM course_assessment_submissions cas
      JOIN course_users cu
      ON cas.creator_id = cu.user_id
      JOIN course_assessment_answers caa
      ON cas.id = caa.submission_id
      WHERE
        cas.creator_id IN (#{@all_students.map(&:user_id).join(', ')})
        AND cas.assessment_id IN (#{@assessments.pluck(:id).join(', ')})
        AND cu.course_id = #{current_course.id}
        AND caa.current_answer = TRUE
      GROUP BY cu.id, cas.id, cas.workflow_state, cas.creator_id, cas.created_at, cas.submitted_at,
        cas.assessment_id
                                                                   ")
  end

  def all_submissions_for_student_info
    all_submissions = all_submissions_info

    all_submissions.to_a.map do |s|
      key = [s['assessment_id'], s['course_user_id']]
      value = [s['id'], s['workflow_state'], time_taken(s), s['submitted_at'], s['grade']]

      [key, value]
    end.to_h
  end

  def time_taken(submission)
    return nil if !submission['submitted_at'] || !submission['created_at']

    submission['submitted_at'].to_i - submission['created_at'].to_i
  end

  def assessment_info_array
    @assessment_info_array ||= Course::Assessment.published.with_default_reference_time.
                               where.not(course_reference_times: { end_at: nil }).
                               where(course_id: current_course.id).
                               pluck(:id, 'course_lesson_plan_items.title',
                                     :start_at, :end_at)
  end

  def user_submission_array # rubocop:disable Metrics/AbcSize
    submission_data_arr = Course::Assessment::Submission.joins(creator: :course_users).
                          where(assessment_id: assessment_info_array.map { |i| i[0] },
                                course_users: { course_id: current_course.id, role: :student }).
                          group(:creator_id, 'course_users.name', 'course_users.phantom').
                          pluck(:creator_id, 'course_users.name', 'course_users.phantom',
                                'json_agg(assessment_id)', 'array_agg(submitted_at)')

    submission_data_arr.map do |sub_data|
      assessment_to_submitted_at = sub_data[3].zip(sub_data[4]).map do |assessment_id, submitted_at|
        if submitted_at.nil?
          nil
        else
          [assessment_id, submitted_at]
        end
      end.compact

      [sub_data[0], sub_data[1], sub_data[2], assessment_to_submitted_at] # id, name, phantom, [ass_id, sub_at]
    end
  end

  def correctness_hash
    query = CourseUser.find_by_sql(<<-SQL.squish
      SELECT
        id,
        AVG(correctness) AS correctness
      FROM (
        SELECT
          cu.id AS id,
          SUM(caa.grade) / SUM(caq.maximum_grade) AS correctness
        FROM
          course_assessment_categories cat
          INNER JOIN course_assessment_tabs tab
          ON tab.category_id = cat.id
          INNER JOIN course_assessments ca
          ON ca.tab_id = tab.id
          INNER JOIN course_assessment_submissions cas
          ON cas.assessment_id = ca.id
          INNER JOIN course_assessment_answers caa
          ON caa.submission_id = cas.id
          INNER JOIN course_assessment_questions caq
          ON caa.question_id = caq.id
          INNER JOIN course_users cu
          ON cu.user_id = cas.creator_id
        WHERE
          cat.course_id = #{current_course.id}
          AND caa.current_answer IS true
          AND cas.workflow_state IN ('graded', 'published')
          AND cu.course_id = #{current_course.id}
          AND cu.role = 0
        GROUP BY
          cu.id,
          cas.assessment_id
        HAVING
          SUM(caq.maximum_grade) > 0
      ) course_user_assessment_correctness
      GROUP BY
        id
    SQL
                                  )
    query.map { |u| [u.id, u.correctness] }.to_h
  end

  def fetch_all_assessment_related_statistics_hash
    @grades_hash = grade_statistics_hash
    @max_grades_hash = max_grade_statistics_hash
    @durations_hash = duration_statistics_hash
    @num_attempted_students_hash = num_attempted_students_hash
    @num_submitted_students_hash = num_submitted_students_hash
    @num_late_students_hash = num_late_students_hash
  end

  def fetch_assessment_timeline_hash
    @personal_timeline = personal_timeline_hash(@assessments.pluck(:id), current_course.id)
    @reference_timeline = reference_times_hash(@assessments.pluck(:id), current_course.id)
  end

  def course_users
    @course_users ||= current_course.course_users.includes(:groups)
  end

  def group_manager_preload_service
    staff = course_users.staff
    Course::GroupManagerPreloadService.new(staff)
  end

  # Pre-loads course levels to avoid N+1 queries when course_user.level_numbers are displayed.
  def preload_levels
    current_course.levels.to_a
  end
end
