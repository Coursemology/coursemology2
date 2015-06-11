module Extensions::HighVoltagePageActionClass::ActionView::Base
  def page_action_class
    if controller.is_a?(HighVoltage::PagesController)
      current_page = controller.current_page
      current_page.slice('pages/'.length, current_page.length)
    else
      super
    end
  end
end
