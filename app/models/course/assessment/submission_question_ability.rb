# frozen_string_literal: true
module Course::Assessment::SubmissionQuestionAbility
  def define_permissions
    if course_user
      allow_students_view_past_answers_submission_question if course_user.student?
      allow_staff_view_past_answers_submission_questions if course_user.staff?
    end

    super
  end

  def allow_students_view_past_answers_submission_question
    can :past_answers, Course::Assessment::SubmissionQuestion, submission: { creator_id: user.id }
  end

  def allow_staff_view_past_answers_submission_questions
    can :past_answers, Course::Assessment::SubmissionQuestion, discussion_topic: { course_id: course.id }
  end
end
