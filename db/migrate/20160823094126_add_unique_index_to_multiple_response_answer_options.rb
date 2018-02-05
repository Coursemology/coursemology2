class AddUniqueIndexToMultipleResponseAnswerOptions < ActiveRecord::Migration[4.2]
  def change
    remove_duplicates
    add_index :course_assessment_answer_multiple_response_options, [:answer_id, :option_id],
              unique: true,
              name: 'index_multiple_response_answer_on_answer_id_and_option_id'
  end

  def remove_duplicates
    grouped = Course::Assessment::Answer::MultipleResponseOption.
              all.group_by { |mro| [mro.answer_id, mro.option_id] }
    grouped.values.each do |duplicates|
      duplicates.pop # Keep last one
      duplicates.each(&:destroy)
    end
  end
end
