class AddSupportToAttachmentTypeQuestion < ActiveRecord::Migration[6.0]
  def up
    add_column :course_assessment_question_text_responses, :is_attachment_required, :boolean, null: false, default: false
    add_column :course_assessment_question_text_responses, :max_attachments, :integer, null: false, default: 0

    # migrate all values inside allow_attachment into max_attachments

    # max_attachments will contain the maximum number of attachments allowed within one question
    # for the initial migration, we would like to maintain the allowance of attachment as much as possible
    # therefore, if allow_attachment is FALSE, we map it to 0 -> no attachment is allowed
    # otherwise, we map it into 50 -> the highest number of attachments possible after this migration
    Course::Assessment::Question::TextResponse.update_all('max_attachments = CASE WHEN allow_attachment THEN 50 ELSE 0 END')
    remove_column :course_assessment_question_text_responses, :allow_attachment
  end

  def down
    remove_column :course_assessment_question_text_responses, :is_attachment_required
    add_column :course_assessment_question_text_responses, :allow_attachment, :boolean, null: false, default: false

    # migrate all values inside attachment_type into allow_attachment

    # in the reverse process, it would not be the exact conversion from the up process since we convert from number to bool
    # in case max_attachments is zero, we map it back to FALSE -> no attachment allowed
    # otherwise (nonzero max_attachments recorded), map it back to TRUE -> multiple attachment allowed
    Course::Assessment::Question::TextResponse.update_all('allow_attachment = (max_attachments <> 0)')
    remove_column :course_assessment_question_text_responses, :max_attachments
  end
end
