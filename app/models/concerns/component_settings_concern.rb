# frozen_string_literal: true
module ComponentSettingsConcern
  extend ActiveSupport::Concern

  # Returns the ids of enabled components that can be disabled
  #
  # @return [Array<String>] The array which stores the ids, ids here are the keys of components
  def enabled_component_ids
    enabled_components.select(&:can_be_disabled?).map(&:key).map(&:to_s)
  end

  # Disable/Enable components
  #
  # @param [Array<String>] ids the ids of all the enabled components
  # @return [Array<String>] the ids of all the enabled components
  def enabled_component_ids=(ids)
    disableable_components_ids.each do |id|
      settings.settings(id).enabled = ids.include?(id)
    end
    ids
  end

  # Checks the validity of parameters before they are stored as settings
  #
  # @param [Hash] params Attributes that represent components settings
  # @return [Boolean] true if Attributes are valid
  def valid_params?(params)
    params_id_set = params[:enabled_component_ids].select(&:present?).to_set
    params_id_set.subset?(disableable_components_ids.to_set)
  end

  private

  # By default, component settings are stored under the :component key in the settings tree
  def settings
    @settable.settings(:components)
  end

  # Returns the ids of all the components that can be disabled
  #
  # @return [Array<String>] The array which stores the ids, ids here are the keys of components
  def disableable_components_ids
    @disableable_components_ids ||= disableable_components.map(&:key).map(&:to_s)
  end

  # Array of components that are enabled
  #
  # @return [Array<Class>] Array of enabled components
  def enabled_components
    raise NotImplementedError, 'To be implemented by the concrete component settings model'
  end

  # Array of components that can be disabled
  #
  # @return [Array<Class>] Array of disable-able components
  def disableable_components
    raise NotImplementedError, 'To be implemented by the concrete component settings model'
  end
end
