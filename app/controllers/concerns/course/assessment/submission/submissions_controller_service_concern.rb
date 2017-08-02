# frozen_string_literal: true
module Course::Assessment::Submission::SubmissionsControllerServiceConcern
  extend ActiveSupport::Concern

  private

  # Get the service class based on the assessment display mode.
  #
  # @return [Class] The class of the service.
  def service_class
    Course::Assessment::Submission::UpdateService
  end

  # Instantiate a service based on the assessment display mode.
  #
  # @return [Course::Assessment::Submission::UpdateService] The service instance.
  def service
    @service ||= service_class.new(self, assessment: @assessment, submission: @submission)
  end

  # Extract the defined instance variables from the service, so that views can access them.
  # Call this method at the end of the action if there are any instance variables defined in the
  # action.
  # @param [Course::Assessment::UpdateService] service the service instance.
  def extract_instance_variables(service)
    service.instance_variables.each do |name|
      value = service.instance_variable_get(name)
      instance_variable_set(name, value)
    end
  end

  module ClassMethods
    # Delegate the action to the service and extract the instance variables from the service after
    # the action is done.
    # @param [Symbol] action the name of the action to delegate.
    def delegate_to_service(action)
      define_method(action) do
        service.public_send(action)
        extract_instance_variables(service)
      end
    end
  end
end
