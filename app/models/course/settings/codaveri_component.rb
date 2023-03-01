# frozen_string_literal: true
class Course::Settings::CodaveriComponent < Course::Settings::Component
  include ActiveModel::Conversion

  def self.component_class
    Course::CodaveriComponent
  end

  # Returns the ITSP requirement of codaveri component
  #
  # @return [String] The custom or default ITSP requirement of codaveri component
  def is_only_itsp
    settings.is_only_itsp
  end

  # Sets the ITSP requirement of codaveri component
  #
  # @param [String] title The new ITSP requirement
  def is_only_itsp=(is_only_itsp)
    is_only_itsp = nil if is_only_itsp.nil?
    settings.is_only_itsp = is_only_itsp
  end

  # Returns the solution requirement of codaveri component
  #
  # @return [String] The custom or default solution requirement of codaveri component
  def is_solution_required
    settings.is_solution_required
  end

  # Sets the solution requirement of codaveri component
  #
  # @param [String] title The new solution requirement
  def is_solution_required=(is_solution_required)
    is_solution_required = true if is_solution_required.nil?
    settings.is_solution_required = is_solution_required
  end
end
