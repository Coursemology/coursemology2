# frozen_string_literal: true
class User::Identity < ApplicationRecord
  validates_length_of :provider, allow_nil: true, maximum: 255
  validates_presence_of :provider
  validates_length_of :uid, allow_nil: true, maximum: 255
  validates_presence_of :uid
  validates_presence_of :user
  validates_uniqueness_of :provider, scope: [:uid], allow_nil: true,
                                     if: -> { uid? && provider_changed? }
  validates_uniqueness_of :uid, scope: [:provider], allow_nil: true,
                                if: -> { provider? && uid_changed? }

  belongs_to :user, inverse_of: :identities

  scope :facebook, -> { where(provider: 'facebook') }
end
