# frozen_string_literal: true
class Course::Assessment::Answer::LiveFeedback::ThreadService
  include Course::Assessment::Question::CodaveriQuestionConcern

  def initialize(user, course, question)
    @user = user
    @course = course
    @question = question
    @type = question.language.type.constantize
    @custom_prompt = question.live_feedback_custom_prompt

    # TODO: remove course.instance, course.profile once Codaveri set default value
    @thread_object = {
      context: {
        user: { id: @user.id.to_s },
        course: {
          instance: @course.instance.name,
          name: @course.title,
          profile: {
            experienceLevel: 'novice',
            educationLevel: 'underGraduate'
          }
        },
        problem: { id: @question.codaveri_id },
        runtime: {
          language: question.language.extend(CodaveriLanguageConcern).codaveri_language,
          version: question.language.extend(CodaveriLanguageConcern).codaveri_version
        }
      },
      llmConfig: {
        model: @course.codaveri_model
      },
      messages: []
    }

    extend_thread_object_with_instructor_prompts
  end

  def extend_thread_object_with_instructor_prompts
    unless !@course.codaveri_override_system_prompt? || @course.codaveri_system_prompt.blank?
      @thread_object[:messages] << {
        role: 'system',
        content: truncate_prompt(@course.codaveri_system_prompt)
      }
    end
    return if @custom_prompt.blank?

    @thread_object[:messages] << {
      role: 'custom',
      content: truncate_prompt(@custom_prompt)
    }
  end

  def run_create_live_feedback_chat
    codaveri_api_service = CodaveriAsyncApiService.new('chat/feedback/threads', @thread_object)
    response_status, response_body = codaveri_api_service.post

    if response_status == 200
      [response_status, response_body['data']]
    else
      [response_status, response_body]
    end
  end

  private

  def truncate_prompt(prompt)
    (prompt.length >= 500) ? prompt[0...500] : prompt
  end
end
