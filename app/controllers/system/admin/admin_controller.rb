# frozen_string_literal: true
class System::Admin::AdminController < System::Admin::Controller
  def index
  end

  def deployment_info
    render json: {
      commit_hash: ENV.fetch('GIT_COMMIT', nil)
    }
  end
end
