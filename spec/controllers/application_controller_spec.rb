require 'rails_helper'

RSpec.describe ApplicationController, type: :controller do
  controller do
    def index
      redirect_to '/'
    end
  end

  describe 'multitenancy' do
    it 'should check the host for multitenancy' do
      @request.headers['host'] = 'coursemology.org'
      get :index

      expect(ActsAsTenant.current_tenant).to eq(Instance.default)
    end
  end
end
