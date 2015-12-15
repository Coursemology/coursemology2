module ApplicationUserMasqueradeConcern
  extend ActiveSupport::Concern

  included do
    before_action :masquerade_user!
  end
end
