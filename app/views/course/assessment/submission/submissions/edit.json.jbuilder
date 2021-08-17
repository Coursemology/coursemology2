# frozen_string_literal: true
can_grade = can?(:grade, @submission)
can_update = can?(:update, @submission)

json.partial! 'submission', submission: @submission, assessment: @assessment,
                            can_grade: can_grade, can_update: can_update

json.assessment do
  json.categoryId @assessment.tab.category_id
  json.tabId @assessment.tab_id
  json.(@assessment, :title, :description, :autograded, :skippable)
  json.showMcqMrqSolution @assessment.show_mcq_mrq_solution
  json.delayedGradePublication @assessment.delayed_grade_publication
  json.tabbedView @assessment.tabbed_view
  json.showPrivate @assessment.show_private
  json.allowPartialSubmission @assessment.allow_partial_submission
  json.showMcqAnswer @assessment.show_mcq_answer
  json.showEvaluation @assessment.show_evaluation
  json.questionIds @submission.questions.map(&:id)
  json.passwordProtected @assessment.session_password_protected?
  json.gamified @assessment.course.gamified?
  json.files @assessment.folder.materials do |material|
    json.url url_for([@assessment.course, @assessment.folder, material])
    json.name format_inline_text(material.name)
  end
end

answers = @submission.current_answers

json.partial! 'questions', assessment: @assessment, submission: @submission, can_grade: can_grade,
                           answers: answers
json.partial! 'answers', submission: @submission, answers: answers
json.partial! 'topics', submission: @submission, can_grade: can_grade
json.partial! 'history', submission: @submission
