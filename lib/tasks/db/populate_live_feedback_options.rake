# frozen_string_literal: true
namespace :db do
  task populate_live_feedback_options: :environment do
    ActsAsTenant.without_tenant do
      puts 'Start populating the options for live feedback'

      ActiveRecord::Base.connection.exec_query(<<-SQL)
        INSERT INTO live_feedback_options
          (option_type, is_enabled)
        VALUES
          (0, TRUE),
          (0, TRUE),
          (0, TRUE),
          (0, TRUE),
          (0, TRUE),
          (1, TRUE)
      SQL
    end
  end
end
