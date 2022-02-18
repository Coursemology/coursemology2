# frozen_string_literal: true
class Course::Tag::Relationship < ApplicationRecord
  belongs_to :tag
  belongs_to :child_tag, class_name: Course::Tag.name
  before_save :validate_acyclic_relationship

  validates :tag, uniqueness: { scope: :child_tag }

  private

  def validate_acyclic_relationship
    return unless tag.is_ancestor_tag_id(child_tag.id)

    errors.add(:cyclic_tags, "cannot add ancestor tag as a child of a tag") if tag.is_ancestor_tag_id(child_tag.id)
  end
end
