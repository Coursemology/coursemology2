# frozen_string_literal: true
class AddProfilePhotoToUsers < ActiveRecord::Migration
  def change
    add_column :users, :profile_photo, :text
  end
end
