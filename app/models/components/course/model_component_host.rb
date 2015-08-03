class Course::ModelComponentHost
  include Componentize

  Course.after_create do
    Course::ModelComponentHost.send(:after_course_create, self)
  end

  def self.after_course_create(course)
    components.each do |component|
      component.after_course_create(course)
    end
  end
  private_class_method :after_course_create

  # Provides ::after_course_create to course components

  module CourseComponentMethods
    extend ActiveSupport::Concern

    module ClassMethods
      # @!method after_course_create(course)
      #   A class method that course components may implement to hook into course initialisation.
      #   @param [Course] course The course under which the initialisation occurs.
      def after_course_create(_course)
      end
    end
  end

  const_get(:Component).module_eval do
    const_set(:ClassMethods, ::Module.new) unless const_defined?(:ClassMethods)
    include CourseComponentMethods
  end
end
