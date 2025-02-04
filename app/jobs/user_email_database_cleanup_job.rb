# frozen_string_literal: true
class UserEmailDatabaseCleanupJob < ApplicationJob
  def perform
    ActsAsTenant.without_tenant do
      @cutoff_timestamp = 6.months.ago
      ActiveRecord::Base.transaction do
        cleanup_unconfirmed_secondary_emails
        cleanup_unconfirmed_users
      end
    end
  end

  private

  def cleanup_unconfirmed_users
    User.
      # Exclude system and deleted special users
      where.not(id: [User::SYSTEM_USER_ID, User::DELETED_USER_ID]).
      where(last_sign_in_at: nil).
      where(
        # Filter for users that do not have any confirmed emails
        'NOT EXISTS (
          SELECT 1 from user_emails
          WHERE user_emails.user_id = users.id
            AND (user_emails.confirmed_at IS NOT NULL OR user_emails.confirmation_sent_at >= ?)
        )', @cutoff_timestamp
      ).
      where.not(id: User::Identity.select(:user_id)).
      # Limit total deletions per job run to avoid bricking the worker
      # Oldest users will be deleted first
      order(:created_at).limit(1000).
      destroy_all
  end

  def cleanup_unconfirmed_secondary_emails
    # Remove any unconfirmed emails associated with remaining users, after unconfirmed users have been removed.
    User::Email.
      where(confirmed_at: nil, primary: false).
      where('confirmation_sent_at < ?', @cutoff_timestamp).
      order(:confirmation_sent_at).limit(1000).
      destroy_all
  end
end
