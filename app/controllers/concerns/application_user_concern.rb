module ApplicationUserConcern
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!, unless: :high_voltage_controller?
  end

  private

  def high_voltage_controller?
    is_a?(HighVoltage::PagesController)
  end
end
