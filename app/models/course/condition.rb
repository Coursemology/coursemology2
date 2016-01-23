class Course::Condition < ActiveRecord::Base
  actable

  belongs_to :course, inverse_of: false
  belongs_to :conditional, polymorphic: true

  delegate :satisfied_by?, to: :actable

  ALL_CONDITIONS = [
    Course::Condition::Achievement.name,
    Course::Condition::Assessment.name,
    Course::Condition::Level.name
  ]

  class << self
    # Finds all conditionals that depend on the given object.
    #
    # @param [Course::Assessment, Course::Achievement] dependent_object An assessment or
    #   achievement that conditionals depends on
    # @return [Object] acts_as_conditional Objects that depend on the condition_object
    def find_conditionals_of(dependent_object)
      condition_classes_of(dependent_object).map do |condition_name|
        Course::Condition.find_by_sql(<<-SQL)
          SELECT * FROM course_conditions cc
            INNER JOIN course_condition_#{condition_name.demodulize.downcase.pluralize} ccs
            ON cc.actable_type = '#{condition_name}'
              AND cc.actable_id = ccs.id
              AND ccs.#{dependent_object.class.name.demodulize.downcase}_id = #{dependent_object.id}
          WHERE course_id = #{dependent_object.course_id}
        SQL
      end.flatten.map(&:conditional)
    end

    private

    # Finds condition classes that depend on the dependent_object. For example, if the
    # dependent_object is a Course::Achievement object, this method should return
    # [Course::Condition::Achievement].
    def condition_classes_of(dependent_object)
      dependent_class_to_condition_class_mapping[dependent_object.class.name]
    end

    # Finds the mapping of dependent classes to arrays of condition classes. For example,
    # {
    #   'Course::Achievement' => ['Course::Condition::Achievement']
    #   'Course::Assessment' => ['Course::Condition::Assessment']
    # }
    def dependent_class_to_condition_class_mapping
      mappings = Course::Condition::ALL_CONDITIONS.map do |condition_name|
        condition_name.constantize.dependent_classes.map do |dependent_name|
          { dependent_name => [condition_name] }
        end
      end.flatten

      mappings.reduce({}) do |mapping1, mapping2|
        mapping1.merge(mapping2) { |_, conditions1, conditions2| conditions1 + conditions2 }
      end
    end
  end
end
