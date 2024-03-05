class AddSupportToAttachmentTypeQuestion < ActiveRecord::Migration[6.0]
  def up
    add_column :course_assessment_question_text_responses, :is_attachment_required, :boolean, null: false, default: false
    add_column :course_assessment_question_text_responses, :attachment_type, :integer, null: false, default: 0

    # migrate all values inside allow_attachment into attachment_type

    # attachment type will have the value either 0 (no attachment), 1 (single file attachment), or 2 (multiple file attachment)
    # for the initial migration, we would like to maintain the allowance of attachment as much as possible
    # therefore, if allow_attachment is FALSE, we map it to 0 -> no attachment is allowed
    # otherwise, we map it into 2 -> multiple attachment is allowed
    Course::Assessment::Question::TextResponse.update_all('attachment_type = CASE WHEN allow_attachment THEN 2 ELSE 0 END')
    remove_column :course_assessment_question_text_responses, :allow_attachment
  end

  def down
    remove_column :course_assessment_question_text_responses, :is_attachment_required
    add_column :course_assessment_question_text_responses, :allow_attachment, :boolean, null: false, default: false

    # migrate all values inside attachment_type into allow_attachment

    # in the reverse process, it would not be the exact conversion from the up process since there will be value 1 here
    # in case attachment_type is zero, we map it back to FALSE -> no attachment allowed
    # otherwise (either single or multiple files allowed), map it back to TRUE -> multiple attachment allowed
    Course::Assessment::Question::TextResponse.update_all('allow_attachment = (attachment_type <> 0)')
    remove_column :course_assessment_question_text_responses, :attachment_type
  end
end
