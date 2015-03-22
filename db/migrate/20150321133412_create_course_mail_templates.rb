class CreateCourseMailTemplates < ActiveRecord::Migration
  def change
    create_table :course_mail_templates do |t|
      t.string :subject, default: ''
      t.string :pre_message, default: ''
      t.string :post_message, default: ''

      t.belongs_to :course, null: false
      t.integer :action, null: false, default: 0
      t.index [:course_id, :action], unique: true

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps
    end
  end
end
