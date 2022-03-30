# frozen_string_literal: true
module Extensions::Conditional::ActiveRecord::Base
  module ClassMethods
    # Functions from conditional-and-condition framework.
    # Declare this function in the conditional model that requires conditions.
    def acts_as_conditional
      enum satisfiability_type: [:all_conditions, :at_least_one_condition]

      has_many :conditions, -> { includes :actable },
               class_name: Course::Condition.name, as: :conditional, dependent: :destroy,
               inverse_of: :conditional
      validates :satisfiability_type, presence: true
      after_save :evaluate_coursewide_conditional_satisfiabilities

      include ConditionalInstanceMethods
    end

    # Declare this function in the condition model
    def acts_as_condition
      acts_as :condition, class_name: Course::Condition.name

      include ConditionInstanceMethods
      extend ConditionClassMethods
    end
  end

  module ConditionalInstanceMethods
    extend ActiveSupport::Concern

    DEFAULT_COURSEWIDE_CONDITIONAL_SATISFIABILIY_EVALUATION_DELAY = 5.minutes

    included do
      after_initialize :set_default_satisfiability_type, if: :new_record?
    end

    def specific_conditions
      conditions.map(&:actable)
    end

    # Sets the satisfiability type to all conditions.
    def set_all_conditions_satisfiability_type!
      self.satisfiability_type = :all_conditions
    end

    # Sets the satisfiability type to at least one condition.
    def set_at_least_one_condition_satisfiability_type!
      self.satisfiability_type = :at_least_one_condition
    end

    # Check if the necessary conditions are satisfied by the user.
    #
    # @param [CourseUser] course_user The user that conditions are being checked on
    # @return [Boolean] true if the necessary conditions are met
    def conditions_satisfied_by?(course_user)
      return true if conditions.empty?

      if satisfiability_type.to_s == :at_least_one_condition.to_s
        conditions.any? { |condition| condition.satisfied_by?(course_user) }
      else
        conditions.all? { |condition| condition.satisfied_by?(course_user) }
      end
    end

    # Permit the conditional for the given course user.
    #
    # @param [CourseUser] _course_user The course user in which the conditional is to unlock for
    def permitted_for!(_course_user)
      raise NotImplementedError, 'Subclasses must implement a permitted_for! method.'
    end

    # Preclude the conditional for the given course user.
    #
    # @param [CourseUser] _course_user The course user in which the conditional is to lock for
    def precluded_for!(_course_user)
      raise NotImplementedError, 'Subclasses must implement a precluded_for! method.'
    end

    # Whether the conditional is satisfiable?.
    # e.g. Unpublished achievements should not never be satisfied and give to users.
    def satisfiable?
      raise NotImplementedError, 'Subclasses must implement a #satisfiable? method.'
    end

    # Duplicate conditions if dependent objects have been duplicated
    def duplicate_conditions(duplicator, other)
      conditions_to_duplicate = other.conditions.to_a.select do |condition|
        dependent_object = condition.actable.dependent_object
        duplicated = duplicator.duplicated?(condition.actable.dependent_object)
        duplicator.mode == :course ? (dependent_object.nil? || duplicated) : duplicated
      end.map(&:actable)
      conditions << duplicator.duplicate(conditions_to_duplicate).map(&:acting_as)
    end

    private

    # Sets the conditional's satisfiability type to the default
    # (all conditions) if it does not exist.
    def set_default_satisfiability_type
      self.satisfiability_type ||= :all_conditions
    end

    # Evaluates conditional satisfiabilities for the entire course
    def evaluate_coursewide_conditional_satisfiabilities
      conditional_satisfiability_evaluation_time = Time.now
      current_course = Course.find(course_id)
      current_course.conditional_satisfiability_evaluation_time = conditional_satisfiability_evaluation_time
      current_course.save!

      Course::Conditional::CoursewideConditionalSatisfiabilityEvaluationJob.set(
        wait: DEFAULT_COURSEWIDE_CONDITIONAL_SATISFIABILIY_EVALUATION_DELAY
      ).perform_later(
        current_course, conditional_satisfiability_evaluation_time
      )
    end
  end

  module ConditionInstanceMethods
    extend ActiveSupport::Concern

    included do
      after_save :on_condition_change, if: :saved_changes?
    end

    # A human-readable name for each condition; usually just wraps a title
    # or name field. Meant to be used in a polymorphic manner for views.
    def title
      raise NotImplementedError, 'Subclasses must implement a title method.'
    end

    # @return [Object] Conditional object that the condition depends on to check if it is
    #   satisfiable
    def dependent_object
      raise NotImplementedError, 'Subclasses must implement a dependent_object method.'
    end

    # Checks if the condition is satisfied by the user.
    #
    # @param [CourseUser] _user The user that the condition is being checked on
    # @return [Boolean] true if the condition is met and false otherwise
    def satisfied_by?(_user)
      raise NotImplementedError, 'Subclasses must implement a satisfied_by? method.'
    end

    private

    def on_condition_change
      execute_after_commit { rebuild_satisfiability_graph(course) }
    end

    # Rebuild the satisfiability graph for the given course.
    #
    # @param [Course] course The course with the dependency graph to be built.
    def rebuild_satisfiability_graph(_course)
      # TODO: Replace with the job for building the satisfiability graph
    end

    # @return [Boolean] true if the condition completes a cyclic path in the satifiability graph.
    def cyclic?
      # This condition will add an edge connecting the dependent_object to the conditional in the
      # satisfiability graph. Thus a cyclic dependency will be created if there is an existing
      # path from the conditional to the dependent_object.
      Course::Conditional::UserSatisfiabilityGraph.reachable?(conditional, dependent_object)
    end
  end

  module ConditionClassMethods
    # Class that the condition depends on.
    def dependent_class
      raise NotImplementedError, 'Subclasses must implement a dependent_class method.'
    end

    # Evaluate and update the satisfied conditionals for the given course user.
    #
    # @param [CourseUser] course_user The user with conditionals to be evaluated
    # @return [Course::Conditional::ConditionalSatisfiabilityEvaluationJob] The job instance
    def evaluate_conditional_for(course_user)
      Course::Conditional::ConditionalSatisfiabilityEvaluationJob.perform_later(course_user)
    end
  end
end
