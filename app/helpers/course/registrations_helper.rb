module Course::RegistrationsHelper
  def active_tab?(tab_name)
    'active' if controller_name == tab_name
  end
end
