# frozen_string_literal: true
class Course::Material::TextChunk < ApplicationRecord
  has_neighbors :embedding
  belongs_to :material, inverse_of: :text_chunks, class_name: 'Course::Material',
                        foreign_key: :course_material_id, autosave: true
  validates :creator, presence: true
  validates :content, presence: true
  validates :embedding, presence: true
  validates :course_id, presence: true
end
