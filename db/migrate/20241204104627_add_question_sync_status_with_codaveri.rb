class AddQuestionSyncStatusWithCodaveri < ActiveRecord::Migration[7.0]
  def change
    add_column :course_assessment_question_programming, :is_synced_with_codaveri, :boolean, default: false, null: false

    # for all existing questions with Codaveri ID, we mark them as synced with Codaveri
    # since in the past, we always ensure that Codaveri question got synced whenever we
    # activate either codaveri evaluation or live feedback
    Course::Assessment::Question::Programming.where.not(codaveri_id: nil).update_all(is_synced_with_codaveri: true)
  end  
end
