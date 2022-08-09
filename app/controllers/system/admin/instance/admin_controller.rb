# frozen_string_literal: true
class System::Admin::Instance::AdminController < System::Admin::Instance::Controller
  def index
    respond_to do |format|
      format.html { render 'system/admin/instance/admin/index' }
      format.json { render 'system/admin/instance/admin/index' }
    end
  end
end
