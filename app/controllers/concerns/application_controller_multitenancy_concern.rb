# frozen_string_literal: true
module ApplicationControllerMultitenancyConcern
  extend ActiveSupport::Concern
  include ApplicationMultitenancy

  included do
    set_current_tenant_through_filter
    before_action :deduce_and_set_current_tenant

    helper_method :current_tenant
  end
end
