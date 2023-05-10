# frozen_string_literal: true
class UserEmailDatabaseCleanupJob < ApplicationJob
  def perform
    unconfirmed_user_ids = User::Email.where(confirmed_at: nil).
                           where('confirmation_sent_at < ?', 6.months.ago).pluck(:user_id)
    identity_user_ids = User::Identity.pluck(:user_id)
    user_ids_to_remove = unconfirmed_user_ids - identity_user_ids
    user_ids_to_remove.each do |user_id|
      User.find(user_id).destroy
    end
  end
end
