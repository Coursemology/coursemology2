class ConvertAutogradedTextResponseAnswersToPlaintext < ActiveRecord::Migration[5.0]
  # For autograded text response questions, a plaintext textarea input box is shown instead of
  # the rich text editor.
  #
  # Convert existing answers to autograded questions from HTML to plaintext.
  def up
    auto_gradable_tr_question_ids = Course::Assessment::Question::TextResponse.includes(:solutions).
                                    select(&:auto_gradable?).map(&:acting_as).map(&:id)

    Course::Assessment::Answer.where(question_id: auto_gradable_tr_question_ids).includes(:actable).
      find_each do |ans|
      answer_text = ans.actable.answer_text
      next if answer_text.empty?
      sanitized_answer = Sanitize.fragment(answer_text).strip.encode(universal_newline: true)
      ans.actable.update_column(:answer_text, sanitized_answer)
    end
  end

  # Formatting can't be restored.
  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
