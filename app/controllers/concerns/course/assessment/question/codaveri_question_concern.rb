# frozen_string_literal: true
module Course::Assessment::Question::CodaveriQuestionConcern
  extend ActiveSupport::Concern

  # Pushes the question to Codaveri as it is now, unless Codaveri already has it. Pushes are serialised on the
  # question's row, and each pushes the question's current package and test cases, so the latest version is the one
  # left on Codaveri even when pushes are requested out of order.
  #
  # @raise [CodaveriError] When Codaveri rejects the question. The failure is still recorded on the question.
  def safe_create_or_update_codaveri_question(question)
    error = nil
    question.with_lock do
      next if question.is_synced_with_codaveri

      # we bypass the processing of the package since this function is called only when
      # we create the Codaveri question from duplicate on-demand, which means that
      # the question has already been created; we just need to propagate this question
      # to Codaveri
      question.skip_process_package = true
      Course::Assessment::Question::ProgrammingCodaveriService.
        create_or_update_question(question, question.attachment)
    rescue CodaveriError => e
      # Raised after the lock's transaction commits, so that the failure status recorded above is kept.
      error = e
    end
    raise error if error
  end

  def extract_pathname_from_java_file(file_content)
    # extracts pathname based on public class of java file
    class_name_extractor = /(?:^|;)\s*public\s+class\s+([A-Za-z_][A-Za-z0-9_]*)/
    match = file_content.match(class_name_extractor)

    match ? "#{match[1]}.java" : nil
  end
end
