# frozen_string_literal: true
class DuplicationTraceable < ApplicationRecord
  actable

  validates :actable_type, length: { maximum: 255 }, allow_nil: true
  validates :actable_type, uniqueness: { scope: [:actable_id], allow_nil: true,
                                         if: -> { actable_id? && actable_type_changed? } }
  validates :actable_id, uniqueness: { scope: [:actable_type], allow_nil: true,
                                       if: -> { actable_type? && actable_id_changed? } }
end
