# frozen_string_literal: true
class CikgoUser < ApplicationRecord
  validates :user, presence: true
  validates :provided_user_id, presence: true

  belongs_to :user, inverse_of: :cikgo_user
end
