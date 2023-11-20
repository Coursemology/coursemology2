# frozen_string_literal: true
assessment = @assessment
assessment_conditions = @assessment_conditions
assessment_time = @assessment_time
requirements = @requirements
questions = @questions
question_assessments = @question_assessments

can_attempt = can?(:attempt, assessment)
can_observe = can?(:observe, assessment)
can_manage = can?(:manage, assessment)

json.partial! 'assessment_list_data', assessment: @assessment, category: @category, tab: @tab, course: current_course

json.description assessment.description unless @assessment.description.blank?
json.autograded assessment.autograded?
json.hasTodo assessment.has_todo if can_manage
json.indexUrl course_assessments_path(current_course, category: assessment.tab.category_id, tab: assessment.tab)

json.startAt do
  json.partial! 'course/lesson_plan/items/personal_or_ref_time', locals: {
    item: assessment,
    course_user: current_course_user,
    attribute: :start_at,
    datetime_format: :long
  }
end

if assessment_time.end_at.present?
  json.endAt do
    json.partial! 'course/lesson_plan/items/personal_or_ref_time', locals: {
      item: assessment,
      course_user: current_course_user,
      attribute: :end_at,
      datetime_format: :long
    }
  end
end

if assessment_conditions
  json.unlocks assessment_conditions do |condition|
    json.partial! partial: condition, suffix: 'condition'
  end
end

if current_course.gamified?
  json.baseExp assessment.base_exp if assessment.base_exp > 0
  json.timeBonusExp assessment.time_bonus_exp if assessment.time_bonus_exp > 0

  if assessment_time.bonus_end_at.present?
    json.bonusEndAt do
      json.partial! 'course/lesson_plan/items/personal_or_ref_time', locals: {
        item: assessment,
        course_user: current_course_user,
        attribute: :bonus_end_at,
        datetime_format: :long
      }
    end
  end
end

json.partial! 'assessment_actions', assessment: assessment, submissions: @submissions

json.hasAttempts @submissions.exists?

json.permissions do
  json.canAttempt can_attempt
  json.canManage can_manage
  json.canObserve can_observe
end

unless can_attempt
  not_started_for_user = assessment_not_started(assessment.time_for(current_course_user))
  json.willStartAt assessment.time_for(current_course_user).start_at if not_started_for_user
end

json.requirements(requirements.sort_by { |condition| condition[:satisfied] ? 1 : 0 })

if can_attempt && assessment.folder.materials.exists?
  materials_enabled = !current_component_host[:course_materials_component].nil?
  json.materialsDisabled !materials_enabled unless materials_enabled
  json.componentsSettingsUrl course_admin_components_path(current_course) unless materials_enabled

  if materials_enabled || can_manage
    json.partial! 'layouts/materials', locals: {
      folder: assessment.folder,
      materials_enabled: materials_enabled
    }
  end
end

if can_observe
  json.allowRecordDraftAnswer assessment.allow_record_draft_answer
  json.showMcqMrqSolution assessment.show_mcq_mrq_solution
  json.gradedTestCases display_graded_test_types(assessment)

  if assessment.autograded?
    json.skippable assessment.skippable
    json.allowPartialSubmission assessment.allow_partial_submission
    json.showMcqAnswer assessment.show_mcq_answer
  end

  is_all_questions_autogradable = questions.map(&:specific).all?(&:auto_gradable?)
  json.hasUnautogradableQuestions assessment.autograded? && !is_all_questions_autogradable

  json.questions question_assessments do |question_assessment|
    json.partial! 'course/question_assessments/question_assessment', question_assessment: question_assessment
  end

  if can_manage
    json.newQuestionUrls [
      {
        type: 'multipleChoice',
        url: new_course_assessment_question_multiple_response_path(current_course, assessment, {
          multiple_choice: true
        })
      },
      {
        type: 'multipleResponse',
        url: new_course_assessment_question_multiple_response_path(current_course, assessment)
      },
      {
        type: 'textResponse',
        url: new_course_assessment_question_text_response_path(current_course, assessment)
      },
      {
        type: 'audioResponse',
        url: new_course_assessment_question_voice_response_path(current_course, assessment)
      },
      {
        type: 'fileUpload',
        url: new_course_assessment_question_text_response_path(current_course, assessment, { file_upload: true })
      },
      {
        type: 'programming',
        url: new_course_assessment_question_programming_path(current_course, assessment)
      },
      {
        type: 'scribing',
        url: new_course_assessment_question_scribing_path(current_course, assessment)
      },
      {
        type: 'forumPostResponse',
        url: new_course_assessment_question_forum_post_response_path(current_course, assessment)
      }
      # TODO: Uncomment when TextResponseComprehension is ready
      # {
      #   type: 'textResponseComprehension',
      #   url: new_course_assessment_question_text_response_path(current_course, assessment, { comprehension: true }),
      # }
    ]
  end
end
