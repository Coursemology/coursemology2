# frozen_string_literal: true
namespace :db do
  task remove_draft_programming_answer: :environment do
    ActsAsTenant.without_tenant do
      answers = Course::Assessment::Answer.where(current_answer: false,
                                                 workflow_state: 'attempting')

      answers.each(&:destroy!)
    end
  end
end
