json.questionId answer.question_id

last_attempt = last_attempt(answer)
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

  if can_grade || answer.submission.published?
    json.grade answer&.grade&.to_f
  end
end
