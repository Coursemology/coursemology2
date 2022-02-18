# frozen_string_literal: true
class Course::Material::Download < ApplicationRecord
  belongs_to :course_user
  belongs_to :material

  validates :course_user, uniqueness: { scope: :material }
end
