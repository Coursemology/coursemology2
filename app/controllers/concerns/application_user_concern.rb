module ApplicationUserConcern
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!, unless: :publicly_accessible?
  end

  private

  def publicly_accessible?
    is_a?(HighVoltage::PagesController)
  end
end
