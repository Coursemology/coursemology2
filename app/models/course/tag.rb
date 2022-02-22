class Course::Tag < ApplicationRecord
  validates :title, length: { maximum: 255 }, presence: true
  validates :course, presence: true

  belongs_to :course, inverse_of: :tags
  has_many :relationships
  has_many :child_tags, through: :relationships

  def initialize_duplicate(duplicator, other)
    self.course = duplicator.options[:destination_course]
    relationships << other.relationships.
                     select { |relationship| duplicator.duplicated?(relationship) }.
                     map { |relationship| duplicator.duplicate(relationship) }
  end

  def is_ancestor_tag_id(tag_id)
    return true if id == tag_id

    parent_tag = Course::Tag::Relationship.find_by(child_tag: self)
    parent_tag ? Course::Tag.find(parent_tag.tag_id).is_ancestor_tag_id(tag_id) : false
  end
end
