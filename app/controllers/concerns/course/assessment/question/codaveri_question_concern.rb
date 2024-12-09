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

  def codaveri_programming_language_map
    {
      Coursemology::Polyglot::Language::CPlusPlus => {
        language: 'cpp',
        version: '10.2'
      },
      Coursemology::Polyglot::Language::Java::Java8 => {
        language: 'java',
        version: '8'
      },
      Coursemology::Polyglot::Language::Java::Java11 => {
        language: 'java',
        version: '11'
      },
      Coursemology::Polyglot::Language::Java::Java17 => {
        language: 'java',
        version: '17'
      },
      Coursemology::Polyglot::Language::Java::Java21 => {
        language: 'java',
        version: '21'
      },
      Coursemology::Polyglot::Language::Python::Python3Point7 => {
        language: 'python',
        version: '3.7'
      },
      Coursemology::Polyglot::Language::Python::Python3Point9 => {
        language: 'python',
        version: '3.9'
      },
      Coursemology::Polyglot::Language::Python::Python3Point10 => {
        language: 'python',
        version: '3.10'
      },
      Coursemology::Polyglot::Language::Python::Python3Point12 => {
        language: 'python',
        version: '3.12'
      },
      Coursemology::Polyglot::Language::R::R4Point1 => {
        language: 'r',
        version: '4.1'
      }
    }
  end
end
