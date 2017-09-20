# frozen_string_literal: true
class User::Identity < ApplicationRecord
  belongs_to :user, inverse_of: :identities

  scope :facebook, -> { where(provider: 'facebook') }
end
