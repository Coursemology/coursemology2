class CreateMailSignOffs < ActiveRecord::Migration
  def change
    create_table :mail_sign_offs do |t|
      t.string :content
      t.belongs_to :course

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps
    end
  end
end
