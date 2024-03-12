# frozen_string_literal: true
class AddMaxSizeToAttachment < ActiveRecord::Migration[6.0]
  def change
    add_column :course_assessment_question_text_responses, :max_attachment_size, :integer
  end
end
