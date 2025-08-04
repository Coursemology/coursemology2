# frozen_string_literal: true
class Course::Statistics::AssessmentsController < Course::Statistics::Controller # rubocop:disable Metrics/ClassLength
  include Course::UsersHelper
  include Course::Statistics::SubmissionsConcern
  include Course::Statistics::UsersConcern

  def assessment_statistics
    @assessment = Course::Assessment.unscoped.
                  includes(programming_questions: [:language]).
                  calculated(:maximum_grade, :question_count).
                  find(assessment_params[:id])

    load_ordered_questions
    create_question_related_hash

    @assessment_autograded = @question_hash.any? { |_, (_, _, auto_gradable)| auto_gradable }
  end

  def submission_statistics
    @assessment = Course::Assessment.unscoped.
                  includes(programming_questions: [:language]).
                  calculated(:maximum_grade, :question_count).
                  find(assessment_params[:id])
    submissions = Course::Assessment::Submission.unscoped.
                  where(assessment_id: assessment_params[:id]).
                  calculated(:grade, :grader_ids)
    @course_users_hash = preload_course_users_hash(current_course)

    load_course_user_students_info
    load_ordered_questions
    create_question_related_hash

    @student_submissions_hash = fetch_hash_for_main_assessment(submissions, @all_students)
  end

  def ancestor_statistics
    @assessment = Course::Assessment.
                  preload(lesson_plan_item: [:reference_times, personal_times: :course_user]).
                  calculated(:maximum_grade).
                  find(assessment_params[:id])
    authorize!(:read_ancestor, @assessment)
    submissions = Course::Assessment::Submission.unscoped.
                  preload(creator: :course_users).
                  where(assessment_id: assessment_params[:id]).
                  calculated(:grade)
    @course_users_hash = preload_course_users_hash(current_course)

    @all_students = @assessment.course.course_users.students
    @student_submissions_hash = fetch_hash_for_ancestor_assessment(submissions, @all_students).compact
  end

  def live_feedback_statistics
    @assessment = Course::Assessment.unscoped.includes(:questions).
                  find(assessment_params[:id])
    @submissions = Course::Assessment::Submission.unscoped.
                   select(:id, :creator_id, :workflow_state).
                   where(assessment_id: assessment_params[:id])

    create_submission_question_id_hash(@assessment.questions)
    load_course_user_students_info
    load_ordered_questions
    create_student_live_feedback_hash
  end

  def live_feedback_history
    user_id = CourseUser.joins(:user).where(id: params[:course_user_id]).pluck('users.id').first
    @submissions = Course::Assessment::Submission.where(assessment_id: assessment_params[:id], creator_id: user_id)
    @question = Course::Assessment::Question.find(params[:question_id])

    create_submission_question_id_hash([@question])

    @messages = Course::Assessment::LiveFeedback::Message.
                joins(:thread).
                where(live_feedback_threads: { submission_question_id: @submission_question_id_hash.values }).
                includes(message_options: :option, message_files: :file).
                order(:created_at)
  end

  def ancestor_info
    fetch_all_ancestor_assessments
  end

  private

  def load_ordered_questions
    @ordered_questions = create_question_order_hash.keys.sort_by { |question_id| @question_order_hash[question_id] }
  end

  def assessment_params
    params.permit(:id)
  end

  def load_course_user_students_info
    @all_students = current_course.course_users.students.includes(user: :emails)
    @group_names_hash = group_names_hash
  end

  def fetch_all_ancestor_assessments
    current_assessment = Course::Assessment.preload(:duplication_traceable).find(assessment_params[:id])
    @ancestors = [current_assessment]
    while current_assessment.duplication_traceable&.source_id.present?
      # TODO: To skip over deleted/non-readable ancestors in duplication chain instead of breaking
      # ActiveRecord::RecordNotFound will occur if source course deleted
      begin
        current_assessment = current_assessment.duplication_traceable.source
      rescue ActiveRecord::RecordNotFound
        break
      end
      break unless can?(:read_ancestor, current_assessment)

      @ancestors.unshift(current_assessment)
    end
  end

  def create_question_related_hash
    create_question_order_hash
    @question_hash = @assessment.questions.to_h do |q|
      [q.id, [q.maximum_grade, q.question_type, q.auto_gradable?]]
    end
  end

  def create_student_live_feedback_hash
    message_grade_hash = fetch_message_grade_hash
    prompt_hash = calculate_prompt_hash(message_grade_hash)
    submission_hash = @submissions.index_by(&:creator_id)

    final_grade_hash = Course::Assessment::Answer.where(
      submission_id: @submissions.pluck(:id),
      current_answer: true
    ).to_h { |answer| [[answer.submission_id, answer.question_id], answer&.grade&.to_f || 0] }

    @student_live_feedback_hash = @all_students.to_h do |student|
      submission = submission_hash[student.user_id]
      live_feedback_data = build_live_feedback_data(submission, final_grade_hash, message_grade_hash, prompt_hash)

      [student, [submission, live_feedback_data]]
    end
  end

  # If grade_before is null (the student didn't submit any code before prompting),
  # we treat it as if it were a blank submission (graded as zero).
  # If grade_after is null (the student didn't submit any new code after the last prompt),
  # we take their final answer to compute the grade improvement metric.

  # Fetches all user Get Help messages grouped by [submission_creator_id, submission_question_id],
  # along with `grade_before` and `grade_after` relative to the message timestamps.
  # The returned structure looks like:
  # {
  #   [4, 70] => {
  #     messages: [
  #       { created_at: "2025-05-30T05:18:48.623076", content: "Explain the question" }
  #     ],
  #     grade_before: 0.0,
  #     grade_after: 75.0
  #   },
  #   [4, 72] => {
  #     messages: [
  #       { created_at: "2025-05-30T05:19:38.71754", content: "Where am I wrong?" },
  #       { created_at: "2025-05-30T05:19:47.08988", content: "How do I fix this?" },
  #       { created_at: "2025-05-30T05:25:04.50411", content: "I am stuck" }
  #     ],
  #     grade_before: 10.0,
  #     grade_after: 10.0
  #   },
  #   ...
  # }
  def fetch_message_grade_hash
    student_ids = @all_students.pluck(:user_id)
    submission_question_ids = @submission_question_id_hash.values

    result = ActiveRecord::Base.connection.execute(
      build_message_grade_sql(student_ids, submission_question_ids)
    )
    result.to_h do |row|
      key = [row['submission_creator_id'], row['submission_question_id']]
      [
        key,
        messages: JSON.parse(row['messages_json']),
        grade_before: row['grade_before']&.to_f || 0,
        grade_after: row['grade_after']&.to_f
      ]
    end
  end

  def build_message_grade_sql(student_ids, submission_question_ids)
    <<-SQL
    WITH feedback_messages AS (
      #{feedback_messages_cte(student_ids, submission_question_ids)}
    ),
    feedback_answers AS (
      #{feedback_answers_cte}
    ),
    grades_before AS (
      #{grades_before_cte}
    ),
    grades_after AS (
      #{grades_after_cte}
    )
    SELECT
      f.submission_creator_id,
      f.submission_question_id,
      f.messages_json,
      gb.grade_before,
      ga.grade_after
    FROM feedback_messages f
    LEFT JOIN grades_before gb ON f.submission_creator_id = gb.submission_creator_id AND f.submission_question_id = gb.submission_question_id
    LEFT JOIN grades_after ga ON f.submission_creator_id = ga.submission_creator_id AND f.submission_question_id = ga.submission_question_id
    SQL
  end

  def feedback_messages_cte(student_ids, submission_question_ids)
    <<-SQL
    SELECT
      lft.submission_creator_id,
      lft.submission_question_id,
      json_agg(json_build_object(
        'created_at', m.created_at,
        'content', m.content
      ) ORDER BY m.created_at) AS messages_json,
      MIN(m.created_at) AS first_message_at,
      MAX(m.created_at) AS last_message_at
    FROM live_feedback_messages m
    JOIN live_feedback_threads lft
      ON lft.id = m.thread_id
    WHERE m.creator_id != #{User::SYSTEM_USER_ID}
      AND lft.submission_creator_id = ANY(ARRAY[#{student_ids.join(',')}])
      AND lft.submission_question_id = ANY(ARRAY[#{submission_question_ids.join(',')}])
    GROUP BY lft.submission_creator_id, lft.submission_question_id
    SQL
  end

  def feedback_answers_cte
    <<-SQL
      SELECT
        a.submission_id,
        a.question_id,
        a.created_at,
        a.grade,
        f.first_message_at,
        f.last_message_at,
        lft.submission_creator_id,
        lft.submission_question_id
      FROM feedback_messages f
      JOIN live_feedback_threads lft ON lft.submission_creator_id = f.submission_creator_id AND lft.submission_question_id = f.submission_question_id
      JOIN course_assessment_submission_questions sq ON sq.id = lft.submission_question_id
      JOIN course_assessment_answers a ON a.submission_id = sq.submission_id AND a.question_id = sq.question_id
    SQL
  end

  def grades_before_cte
    <<-SQL
      SELECT DISTINCT ON (submission_id, question_id)
        grade AS grade_before,
        submission_creator_id,
        submission_question_id
      FROM feedback_answers
      WHERE created_at < first_message_at
      ORDER BY submission_id, question_id, created_at DESC
    SQL
  end

  def grades_after_cte
    <<-SQL
      SELECT DISTINCT ON (submission_id, question_id)
        grade AS grade_after,
        submission_creator_id,
        submission_question_id
      FROM feedback_answers
      WHERE created_at > last_message_at
      ORDER BY
        submission_id,
        question_id,
        CASE WHEN created_at > last_message_at THEN -1 ELSE 1 END,
        (CASE WHEN created_at > last_message_at THEN 1 ELSE -1 END) * EXTRACT(EPOCH FROM created_at)
    SQL
  end

  def build_live_feedback_data(submission, final_grade_hash, message_grade_hash, prompt_hash)
    @ordered_questions.map do |question_id|
      submission_question_id = @submission_question_id_hash[[submission&.id, question_id]]
      key = [submission&.creator_id, submission_question_id]

      message_grade_data = message_grade_hash[key] || {}
      grade_before = message_grade_data[:grade_before]
      grade_after  = message_grade_data[:grade_after]

      prompt_data = prompt_hash[key] || { messages_sent: 0, word_count: 0 }

      grade_diff = if grade_before && grade_after && prompt_data[:messages_sent] > 0
                     (grade_after - grade_before).round(2)
                   end

      {
        grade: final_grade_hash[[submission&.id, question_id]],
        grade_diff: grade_diff,
        word_count: prompt_data[:word_count],
        messages_sent: prompt_data[:messages_sent]
      }
    end
  end

  def calculate_prompt_hash(message_hash)
    message_hash.transform_values do |data|
      messages = data[:messages] || []
      {
        messages_sent: messages.size,
        word_count: messages.sum { |m| m['content'].to_s.split(/\s+/).size }
      }
    end
  end

  def fetch_messages_for_question(submission_question_id)
    Course::Assessment::LiveFeedback::Message.
      joins(:thread).
      where(live_feedback_threads: { submission_question_id: submission_question_id }).
      order(:created_at)
  end

  def create_question_order_hash
    @question_order_hash = @assessment.question_assessments.to_h do |q|
      [q.question_id, q.weight]
    end
  end

  def create_submission_question_id_hash(questions)
    @submission_question_id_hash = Course::Assessment::SubmissionQuestion.unscoped.
                                   select(:id, :submission_id, :question_id).
                                   where(submission_id: @submissions.pluck(:id),
                                         question_id: questions.pluck(:id)).to_h do |sq|
      [[sq.submission_id, sq.question_id], sq.id]
    end
  end
end
