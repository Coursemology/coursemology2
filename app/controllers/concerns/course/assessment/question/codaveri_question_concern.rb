# frozen_string_literal: true
module Course::Assessment::Question::CodaveriQuestionConcern
  extend ActiveSupport::Concern

  def safe_create_or_update_codaveri_question(question)
    question.with_lock do
      next if question.is_synced_with_codaveri

      # we bypass the processing of the package since this function is called only when
      # we create the Codaveri question from duplicate on-demand, which means that
      # the question has already been created; we just need to propagate this question
      # to Codaveri
      question.skip_process_package = true
      Course::Assessment::Question::ProgrammingCodaveriService.
        create_or_update_question(question, question.attachment)
    end
  end
end
