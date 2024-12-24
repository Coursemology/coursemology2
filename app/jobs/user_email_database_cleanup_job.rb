# frozen_string_literal: true
class UserEmailDatabaseCleanupJob < ApplicationJob
  def perform
    ActsAsTenant.without_tenant do
      unconfirmed_user_ids = User.where(
        'NOT EXISTS (
           SELECT 1 FROM user_emails
           WHERE user_emails.user_id = users.id
             AND (user_emails.confirmed_at IS NOT NULL OR user_emails.confirmation_sent_at >= ?)
         )', 6.months.ago
      ).pluck(:id)

      identity_user_ids = User::Identity.pluck(:user_id)
      user_ids_to_remove = unconfirmed_user_ids - identity_user_ids
      ActiveRecord::Base.transaction do
        user_ids_to_remove.each do |user_id|
          User.find(user_id).destroy
        end

        User::Email.
          where(confirmed_at: nil).
          where('confirmation_sent_at < ?', 6.months.ago).
          destroy_all
      end
    end
  end
end
