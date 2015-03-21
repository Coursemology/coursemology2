class CreateMailTemplates < ActiveRecord::Migration
  def change
    create_table :mail_templates do |t|
      t.string :subject
      t.string :pre_message
      t.string :post_message

      t.belongs_to :course
      t.string :action
      t.index [:course_id, :action], unique: true

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps
    end
  end
end
