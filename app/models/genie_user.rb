# frozen_string_literal: true
class GenieUser < ApplicationRecord
  validates :user, presence: true
  validates :provided_user_id, presence: true

  belongs_to :user, inverse_of: :genie_user
end
