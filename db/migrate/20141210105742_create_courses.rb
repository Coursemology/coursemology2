# frozen_string_literal: true
class CreateCourses < ActiveRecord::Migration[4.2]
  def change
    create_table :courses do |t|
      t.references :instance, null: false
      t.string :title, null: false
      t.text :description
      t.integer :status, default: 0, null: false
      t.datetime :start_at, null: false
      t.datetime :end_at, null: false
      t.references :creator, null: false, foreign_key: { references: :users }

      t.timestamps
    end
  end
end
