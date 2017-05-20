can_grade = can?(:grade, @submission)
can_update = can?(:update, @submission)

json.canGrade can_grade
json.canUpdate can_update

json.assessment do
  json.(@assessment, :title, :description, :published, :autograded, :skippable,
    :tabbed_view, :password)
  json.delayedGradePublication @assessment.delayed_grade_publication
  json.passwordProtected @assessment.password_protected?
  json.tabbedView @assessment.tabbed_view
end

if @assessment.autograded?
  question = @assessment.questions.next_unanswered(@submission)
  if question
    json.maxStep @assessment.questions.index(question)
  else
    json.maxStep @assessment.questions.length - 1
  end
end

latest_attempts = @submission.answers.latest_answers
if @assessment.autograded? && @submission.attempting?
  previous_attempts = latest_attempts.map { |a| last_attempt(a) }.reject(&:nil?)
end

json.partial! 'questions', assessment: @assessment, submission: @submission,
                           previous_attempts: previous_attempts, can_grade: can_grade
json.partial! 'answers', latest_attempts: latest_attempts, previous_attempts: previous_attempts,
                         can_grade: can_grade
json.partial! 'comments', submission: @submission
json.partial! 'progress', submission: @submission, can_grade: can_grade
