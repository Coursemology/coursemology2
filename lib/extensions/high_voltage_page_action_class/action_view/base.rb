# frozen_string_literal: true
module Extensions::HighVoltagePageActionClass::ActionView::Base
  def page_action_class
    if controller.is_a?(HighVoltage::PagesController)
      current_page = controller.current_page
      current_page.sub(/^pages\//, '')
    else
      super
    end
  end
end
