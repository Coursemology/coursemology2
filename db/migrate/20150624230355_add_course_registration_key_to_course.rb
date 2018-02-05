# frozen_string_literal: true
class AddCourseRegistrationKeyToCourse < ActiveRecord::Migration[4.2]
  def change
    add_column :courses, :registration_key, :string, limit: 16
    add_index :courses, [:registration_key], unique: true
  end
end
