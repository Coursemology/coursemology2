# frozen_string_literal: true
class Course::Assessment::Answer::LiveFeedback::FeedbackService
  CODAVERI_LANGUAGE_MAPPING = {
    en: 'en',
    zh: 'zh-cn'
  }.freeze
  DEFAULT_CODAVERI_LANGUAGE = 'en'

  def initialize(message, answer)
    @message = message
    @answer = answer.actable

    @feedback_object = {
      preference: {
        language: language_from_locale(answer.submission.creator.locale)
      },
      message: {
        role: 'user',
        content: @message,
        files: []
      },
      tokenSetting: {
        requireToken: true,
        returnResult: true
      }
    }
  end

  def construct_feedback_object
    @answer.files.each do |file|
      file_object = { path: file.filename, content: file.content }
      @feedback_object[:message][:files].append(file_object)
    end

    @feedback_object
  end

  def language_from_locale(locale)
    CODAVERI_LANGUAGE_MAPPING.fetch(locale.to_sym, DEFAULT_CODAVERI_LANGUAGE)
  end

  def request_codaveri_feedback(thread_id)
    construct_feedback_object

    codaveri_api_service = CodaveriAsyncApiService.new("chat/feedback/threads/#{thread_id}/messages", @feedback_object)
    response_status, response_body = codaveri_api_service.post

    [response_status, response_body['data']]
  end
end
