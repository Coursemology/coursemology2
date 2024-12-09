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
          language: question.language.polyglot_name,
          version: question.language.polyglot_version
        }
      }
    }

    extend_thread_object_with_custom_prompt
  end

  def extend_thread_object_with_custom_prompt
    return unless @custom_prompt

    @thread_object.merge({
      message: {
        role: 'user',
        content: (@custom_prompt.length >= 500) ? "#{@custom_prompt[0...495]}..." : @custom_prompt
      }
    })
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
end
