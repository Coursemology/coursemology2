# frozen_string_literal: true
module Extensions::HighVoltagePageActionClass::ActionView::Base
  def page_action_class
    if controller.is_a?(HighVoltage::PagesController)
      # TODO: Depends on thoughtbot/high_voltage#235
      current_page = controller.send(:current_page)
      current_page.sub(/^pages\//, '')
    else
      super
    end
  end
end
