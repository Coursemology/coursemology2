class CreateLiveFeedbackChatTable < ActiveRecord::Migration[7.0]
  def change
    create_table :live_feedback_threads do |t|
      t.references :submission_question, null: false, index: true, foreign_key: { to_table: :course_assessment_submission_questions }
      t.references :submission_creator, null: false, index: true, foreign_key: { to_table: :users }
      t.string :codaveri_thread_id, null: false
      t.boolean :is_active, null: false, default: true
      t.datetime :created_at, null: false
    end

    create_table :live_feedback_options do |t|
      t.integer :option_type, null: false
      t.boolean :is_enabled, null: false, default: false
    end

    create_table :live_feedback_messages do |t|
      t.references :thread, null: false, index: true, foreign_key: { to_table: :live_feedback_threads }
      t.references :option, null: true, index: true, foreign_key: { to_table: :live_feedback_options }
      t.references :creator, null: true, index: true, foreign_key: { to_table: :users }
      t.boolean :is_error, null: false, default: false
      t.string :content, null: false
      t.datetime :created_at, null: false
    end

    create_table :live_feedback_files do |t|
      t.string :filename, null: false
      t.text :content, null: false
    end

    create_table :live_feedback_message_files do |t|
      t.references :message, null: false, index: true, foreign_key: { to_table: :live_feedback_messages }
      t.references :file, null: false, index: true, foreign_key: { to_table: :live_feedback_files }
    end

    create_table :live_feedback_message_options do |t|
      t.references :message, null: false, index: true, foreign_key: { to_table: :live_feedback_messages }
      t.references :option, null: false, index: true, foreign_key: { to_table: :live_feedback_options }
    end
  end
end
