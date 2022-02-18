# frozen_string_literal: true
class Course::Condition::Material < ApplicationRecord
  acts_as_condition
  include DuplicationStateTrackingConcern

  validate :validate_material_condition, if: :material_id_changed?
  validates :material, presence: true

  belongs_to :material, class_name: Course::Material.name, inverse_of: :material_conditions

  default_scope { includes(:material) }

  alias_method :dependent_object, :material

  def title
    self.class.human_attribute_name('title.complete', material_title: material.name)
  end

  def satisfied_by?(course_user)
    Course::Material::Download.exists?(course_user_id: course_user.id, material_id: material.id)
  end

  # Class that the condition depends on.
  def self.dependent_class
    Course::Material.name
  end

  def initialize_duplicate(duplicator, other)
    self.material = duplicator.duplicate(other.material)
    self.conditional_type = other.conditional_type
    self.conditional = duplicator.duplicate(other.conditional)

    case duplicator.mode
    when :course
      self.course = duplicator.duplicate(other.course)
    when :object
      self.course = duplicator.options[:destination_course]
    end

    set_duplication_flag
  end

  private

  def validate_material_condition
    validate_references_self
    validate_unique_dependency unless duplicating?
    validate_acyclic_dependency
  end

  def validate_references_self
    return unless material == conditional

    errors.add(:material, :references_self)
  end

  def validate_unique_dependency
    return unless required_materials_for(conditional).include?(material)

    errors.add(:material, :unique_dependency)
  end

  def validate_acyclic_dependency
    return unless cyclic?

    errors.add(:material, :cyclic_dependency)
  end

  # Given a conditional object, returns all materials that it requires.
  #
  # @param [Object] conditional The object that is declared as acts_as_conditional and for which
  #   returned materials are required.
  # @return [Array<Course::Material]
  def required_materials_for(conditional)
    # Workaround, pending the squeel bugfix (activerecord-hackery/squeel#390), similar issue as in
    # Course::Condition::Material.
    # TODO: use squeel.
    Course::Material.joins(<<-SQL)
      INNER JOIN
        (SELECT cca.material_id
          FROM course_condition_materials cca INNER JOIN course_conditions cc
          ON cc.actable_type = 'Course::Condition::Material' AND cc.actable_id = cca.id
          WHERE cc.conditional_id = #{conditional.id}
            AND cc.conditional_type = #{ActiveRecord::Base.connection.quote(conditional.class.name)}
        ) ids
      ON ids.material_id = course_materials.id
    SQL
  end
end
