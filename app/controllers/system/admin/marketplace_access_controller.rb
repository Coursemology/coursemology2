# frozen_string_literal: true
class System::Admin::MarketplaceAccessController < System::Admin::Controller
  def index
    query = Course::Assessment::Marketplace::AccessListQuery.new
    @rows = query.rows
    @summary = query.summary
  end
end
