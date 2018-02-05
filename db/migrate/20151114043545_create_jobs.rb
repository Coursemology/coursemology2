# frozen_string_literal: true
class CreateJobs < ActiveRecord::Migration[4.2]
  def change
    enable_extension 'uuid-ossp'
    create_table :jobs, id: :uuid do |t|
      t.integer :status, null: false, default: 0
      t.string :redirect_to
      t.json :error
    end
  end
end
