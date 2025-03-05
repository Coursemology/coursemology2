# frozen_string_literal: true
module Course::Statistics::LiveFeedbackConcern
  private

  def fetch_hash_for_live_feedback_assessment(submissions, live_feedback_chats)
    students = @all_students
    student_hash = initialize_student_hash(students)

    populate_hash(submissions, student_hash, live_feedback_chats)
    student_hash
  end

  def initialize_student_hash(students)
    students.to_h { |student| [student, nil] }
  end

  def populate_hash(submissions, student_hash, live_feedback_chats)
    submissions.each do |submission|
      submitter_course_user = find_submitter_course_user(submission)
      next unless submitter_course_user&.student?

      feedback_count = initialize_feedback_count

      live_feedback_chat = find_user_assessment_live_feedback_chat(submitter_course_user,
                                                                   live_feedback_chats)

      update_feedback_count(feedback_count, live_feedback_chat)

      student_hash[submitter_course_user] = [submission, feedback_count]
    end
  end

  def find_submitter_course_user(submission)
    submission.creator.course_users.find_by(course_id: @assessment.course_id)
  end

  def initialize_feedback_count
    Array.new(@question_order_hash.size, 0)
  end

  def find_user_assessment_live_feedback_chat(submitter_course_user, live_feedback_chats)
    live_feedback_chats.where(submission_creator_id: submitter_course_user.user_id)
  end

  def update_feedback_count(feedback_count, live_feedback_chat)
    live_feedback_chat.each do |chat|
      index = @ordered_questions.index(@submission_question_hash[chat.submission_question_id].question_id)
      feedback_count[index] += chat.messages.count
    end
  end
end
