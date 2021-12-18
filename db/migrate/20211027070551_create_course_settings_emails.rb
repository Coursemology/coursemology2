class CreateCourseSettingsEmails < ActiveRecord::Migration[6.0]
  def change
    create_table :course_settings_emails do |t|
      t.references :course, null: false, foreign_key: { references: :courses }
      t.integer :component, null: false
      t.references :course_assessment_category, null: true, foreign_key: { references: :course_assessment_categories }
      t.integer :setting, null: false
      t.boolean :phantom, null: false, default: true
      t.boolean :regular, null: false, default: true
    end

    add_index :course_settings_emails, [:course_id, :component, :course_assessment_category_id, :setting],
                                       unique: true, name: :index_course_settings_emails_composite
    
    Rake::Task['db:migrate_email_settings'].invoke
  end
end
