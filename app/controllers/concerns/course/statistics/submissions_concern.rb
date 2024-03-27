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

  def populate_hash_including_answers(student_hash, submissions)
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

  def populate_hash_without_answers(student_hash, submissions)
    submissions.map do |submission|
      submitter_course_user = submission.creator.course_users.select { |u| u.course_id == @assessment.course_id }.first
      next unless submitter_course_user&.student?

      end_at = @assessment.lesson_plan_item.time_for(submitter_course_user).end_at

      student_hash[submitter_course_user] = [submission, end_at]
    end
  end
end
