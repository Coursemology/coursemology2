# frozen_string_literal: true
json.id @assessment.id
json.title @assessment.title
json.description format_ckeditor_rich_text(@assessment.description)

json.gradingMode @assessment.autograded? ? 'autograded' : 'manual'
json.baseExp @assessment.base_exp if @assessment.base_exp > 0
json.bonusExp @assessment.time_bonus_exp if @assessment.time_bonus_exp > 0
json.showMcqMrqSolution @assessment.show_mcq_mrq_solution
json.showRubricToStudents @assessment.show_rubric_to_students
json.gradedTestCases display_graded_test_types(@assessment)

questions = @assessment.questions.includes(:actable)

# Group by the human-readable type (e.g. "Multiple Choice", "Text Response Question") so the
# breakdown matches the per-question chips and the wording of the real assessment show page,
# instead of raw actable class names ("MultipleResponse").
json.typeCounts questions.group_by(&:question_type_readable).transform_values(&:size)

json.questions questions do |question|
  json.id question.id
  json.title question.title
  json.description format_ckeditor_rich_text(question.description)
  json.staffOnlyComments format_ckeditor_rich_text(question.staff_only_comments)
  json.maximumGrade question.maximum_grade
  # Human-readable label for the type chip, mirroring _question_assessment.json.jbuilder. The
  # renderer dispatch lives on the detail endpoint (which keeps the demodulized discriminator).
  json.type question.question_type_readable
  json.unautogradable !question.auto_gradable?

  if question.actable_type == 'Course::Assessment::Question::MultipleResponse'
    mrq = question.actable
    json.mcqMrqType mrq.multiple_choice? ? 'mcq' : 'mrq' # multiple_choice? is aliased to any_correct?
    json.options mrq.options do |option|
      json.id option.id
      json.option format_ckeditor_rich_text(option.option)
      json.correct option.correct
    end
  end
end
