# frozen_string_literal: true
module Course::Statistics::SubmissionsConcern
  private

  def initialize_student_hash(students)
    students.to_h { |student| [student, nil] }
  end

  def fetch_hash_for_main_assessment(submissions, students)
    student_hash = initialize_student_hash(students)

    populate_hash_including_answers(student_hash, submissions)
    student_hash
  end

  def fetch_hash_for_ancestor_assessment(submissions, students)
    student_hash = initialize_student_hash(students)

    populate_hash_without_answers(student_hash, submissions)
    student_hash
  end

  def answer_statistics_hash
    submission_answer_statistics = Course::Assessment::Answer.find_by_sql(<<-SQL.squish
      WITH
        statistics_info AS (
          SELECT
            caa.question_id,
            caa.submission_id,
            COUNT(*) AS attempt_count,
            MAX(CASE WHEN caa.current_answer = true THEN caa.grade END) AS grade
          FROM course_assessment_answers caa
          JOIN course_assessment_submissions cas ON caa.submission_id = cas.id
          WHERE cas.assessment_id = #{assessment_params[:id]}
          GROUP BY caa.question_id, caa.submission_id
        ),

        attempt_info AS (
          SELECT
            caa_ranked.question_id,
            caa_ranked.submission_id,
            jsonb_agg(jsonb_build_array(caa_ranked.correct, caa_ranked.workflow_state)) AS submission_info
          FROM (
            SELECT
              caa_inner.question_id,
              caa_inner.submission_id,
              caa_inner.correct,
              cas_inner.workflow_state,
              ROW_NUMBER() OVER (PARTITION BY caa_inner.question_id, caa_inner.submission_id ORDER BY caa_inner.created_at DESC) AS row_num
            FROM
              course_assessment_answers caa_inner
            JOIN
              course_assessment_submissions cas_inner ON caa_inner.submission_id = cas_inner.id
            WHERE
              cas_inner.assessment_id = #{assessment_params[:id]}
          ) AS caa_ranked
          WHERE caa_ranked.row_num <= 2
          GROUP BY caa_ranked.question_id, caa_ranked.submission_id
        )

      SELECT
        statistics_info.question_id,
        statistics_info.submission_id,
        statistics_info.attempt_count,
        statistics_info.grade,
        CASE WHEN jsonb_array_length(attempt_info.submission_info) = 1 OR attempt_info.submission_info->0->>1 != 'attempting'
            THEN attempt_info.submission_info->0->>0 ELSE attempt_info.submission_info->1->>0
        END AS correct
      FROM statistics_info
      JOIN attempt_info
      ON statistics_info.question_id = attempt_info.question_id AND statistics_info.submission_id = attempt_info.submission_id
    SQL
                                                                         )

    submission_answer_statistics.group_by { |answer| answer.submission_id }.
      transform_values do |grouped_answers|
        grouped_answers.sort_by { |answer| @question_order_hash[answer.question_id] }
      end
  end

  def populate_hash_including_answers(student_hash, submissions)
    answers_hash = answer_statistics_hash

    submissions.map do |submission|
      submitter_course_user = submission.creator.course_users.select { |u| u.course_id == @assessment.course_id }.first
      next unless submitter_course_user&.student?

      answers = answers_hash[submission.id]
      end_at = @assessment.lesson_plan_item.time_for(submitter_course_user).end_at

      student_hash[submitter_course_user] = [submission, answers, end_at]
    end
  end

  def populate_hash_without_answers(student_hash, submissions)
    submissions.map do |submission|
      submitter_course_user = submission.creator.course_users.select { |u| u.course_id == @assessment.course_id }.first
      next unless submitter_course_user&.student?

      end_at = @assessment.lesson_plan_item.time_for(submitter_course_user).end_at

      student_hash[submitter_course_user] = [submission, end_at]
    end
  end
end
