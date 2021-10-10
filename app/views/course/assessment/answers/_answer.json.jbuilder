# frozen_string_literal: true
json.id answer.id
json.questionId answer.question_id
json.createdAt answer.created_at

specific_answer = answer.specific
can_grade = can?(:grade, answer.submission)

json.partial! specific_answer, answer: specific_answer, can_grade: can_grade

json.grading do
  json.id answer.id

  if answer&.grader && can_grade
    course_user = answer.grader.course_users.find_by(course: controller.current_course)

    json.grader do
      json.name display_user(answer.grader)
      json.id course_user.id if course_user
    end
  end

  json.grade answer&.grade&.to_f if can_grade || answer.submission.published?
end
