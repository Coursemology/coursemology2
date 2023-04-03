# frozen_string_literal: true
module ApplicationCableMultitenancyConcern
  extend ActiveSupport::Concern
  include ApplicationMultitenancy

  included do
    set_current_tenant_through_filter
    before_subscribe :deduce_and_set_current_tenant
  end
end
