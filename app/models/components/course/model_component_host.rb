# frozen_string_literal: true
class Course::ModelComponentHost
  include Componentize

  Course.after_initialize do
    Course::ModelComponentHost.send(:after_course_initialize, self)
  end

  Course.after_create do
    Course::ModelComponentHost.send(:after_course_create, self)
  end

  def self.after_course_initialize(course)
    components.each do |component|
      component.after_course_initialize(course)
    end
  end
  private_class_method :after_course_initialize

  def self.after_course_create(course)
    components.each do |component|
      component.after_course_create(course)
    end
  end
  private_class_method :after_course_create

  # Hook AR callbacks into course components

  module CourseComponentMethods
    extend ActiveSupport::Concern

    module ClassMethods
      # @!method after_course_initialize(course)
      #   A class method that course components may implement to hook into course initialisation.
      #   @param [Course] course The course under which the initialisation occurs.
      def after_course_initialize(_course)
      end

      # @!method after_course_create(course)
      #   A class method that course components may implement to hook into course initialisation.
      #   @param [Course] course The course under which the initialisation occurs.
      def after_course_create(_course)
      end
    end
  end

  module Duplicable
    extend ActiveSupport::Concern

    def initialize_duplicate(_duplicator, _other)
      fail "Implement your own initialize_duplicate method for this component."
    end

    def duplicator_display_string
      fail "Return the string to display on the duplication UI page."
    end
  end

  const_get(:Component).module_eval do
    const_set(:ClassMethods, ::Module.new) unless const_defined?(:ClassMethods)
    include CourseComponentMethods
  end
end
