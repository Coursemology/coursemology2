# frozen_string_literal: true
module Course::Statistics::SubmissionsConcern
  private

  def initialize_student_hash(students)
    students.to_h { |student| [student, nil] }
  end

  def student_submission_end_time_hash(submissions, students)
    student_hash = initialize_student_hash(students)

    populate_with_submission_and_end_time(student_hash, submissions)
    student_hash
  end

  def student_submission_marks_hash(submissions, students)
    student_hash = initialize_student_hash(students)

    populate_with_submission_and_ordered_answer(student_hash, submissions)
    student_hash
  end

  def student_submission_hash(submissions, students)
    student_hash = initialize_student_hash(students)

    populate_with_submission_info(student_hash, submissions)
    student_hash
  end

  def populate_with_submission_and_end_time(student_hash, submissions)
    submissions.map do |submission|
      submitter_course_user = submission.creator.course_users.select { |u| u.course_id == @assessment.course_id }.first
      next unless submitter_course_user&.student?

      end_at = @assessment.lesson_plan_item.time_for(submitter_course_user).end_at

      student_hash[submitter_course_user] = [submission, end_at]
    end
  end

  def populate_with_submission_and_ordered_answer(student_hash, submissions)
    submissions.map do |submission|
      submitter_course_user = submission.creator.course_users.select { |u| u.course_id == @assessment.course_id }.first
      next unless submitter_course_user&.student?

      answers = submission.answers.
                select(&:current_answer).
                sort_by { |answer| @question_order_hash[answer.question_id] }

      student_hash[submitter_course_user] = [submission, answers]
    end
  end

  def populate_with_submission_info(student_hash, submissions)
    submissions.map do |submission|
      submitter_course_user = submission.creator.course_users.select { |u| u.course_id == @assessment.course_id }.first
      next unless submitter_course_user&.student?

      answers = submission.answers.
                select(&:current_answer).
                sort_by { |answer| @question_order_hash[answer.question_id] }
      end_at = @assessment.lesson_plan_item.time_for(submitter_course_user).end_at

      student_hash[submitter_course_user] = [submission, answers, end_at]
    end
  end
end
