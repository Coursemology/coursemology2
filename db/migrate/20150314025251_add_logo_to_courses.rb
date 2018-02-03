# frozen_string_literal: true
class AddLogoToCourses < ActiveRecord::Migration[4.2]
  def change
    add_column :courses, :logo, :text
  end
end
