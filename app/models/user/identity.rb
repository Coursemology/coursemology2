# frozen_string_literal: true
class User::Identity < ApplicationRecord
  validates :provider, length: { maximum: 255 }, presence: true
  validates :uid, length: { maximum: 255 }, presence: true
  validates :user, presence: true
  validates :provider, uniqueness: { scope: [:uid], if: -> { uid? && provider_changed? } }
  validates :uid, uniqueness: { scope: [:provider], if: -> { provider? && uid_changed? } }

  belongs_to :user, inverse_of: :identities

  scope :facebook, -> { where(provider: 'facebook') }
end
