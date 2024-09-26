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
  json.timeLimit @assessment.time_limit
  json.delayedGradePublication @assessment.delayed_grade_publication
  json.tabbedView @assessment.tabbed_view || @assessment.autograded
  json.showPrivate @assessment.show_private
  json.allowPartialSubmission @assessment.allow_partial_submission
  json.showMcqAnswer @assessment.show_mcq_answer
  json.showEvaluation @assessment.show_evaluation
  json.questionIds @submission.questions.pluck(:id)
  json.passwordProtected @assessment.session_password_protected?
  json.gamified @assessment.course.gamified?
  json.isKoditsuEnabled current_course.component_enabled?(Course::KoditsuPlatformComponent) &&
                        @assessment.is_koditsu_enabled &&
                        @assessment.koditsu_assessment_id
  json.files @assessment.folder.materials do |material|
    json.url url_to_material(@assessment.course, @assessment.folder, material)
    json.name format_inline_text(material.name)
  end
  json.isCodaveriEnabled current_course.component_enabled?(Course::CodaveriComponent)
end

current_answer_ids = @submission.current_answers.pluck(:id)
answers = @submission.answers.where(id: current_answer_ids).includes(:actable, { question: { actable: :files } })
submission_questions = @submission.submission_questions.
                       where(question: @submission.questions).includes({ discussion_topic: :posts })

json.partial! 'questions', assessment: @assessment, submission: @submission, can_grade: can_grade,
                           submission_questions: submission_questions, answers: answers
json.partial! 'answers', submission: @submission, answers: answers
json.partial! 'topics', submission: @submission, submission_questions: submission_questions, can_grade: can_grade
json.partial! 'history', submission: @submission

json.monitoringSessionId @monitoring_session_id if @monitoring_session_id.present?
