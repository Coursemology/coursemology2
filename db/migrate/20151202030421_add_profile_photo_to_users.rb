# frozen_string_literal: true
class AddProfilePhotoToUsers < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :profile_photo, :text
  end
end
