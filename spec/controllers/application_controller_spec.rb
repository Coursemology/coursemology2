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

    let(:instance) { create(:instance) }

    it 'should not be case insensitive' do
      @request.headers['host'] = instance.host.upcase
      get :index

      expect(ActsAsTenant.current_tenant).to eq(instance)
    end

    it 'should accept www as a default subdomain' do
      @request.headers['host'] = 'www.' + instance.host.capitalize
      get :index

      expect(ActsAsTenant.current_tenant).to eq(instance)
    end

    it 'should not recognise any subdomain other than www' do
      @request.headers['host'] = 'random.' + instance.host.capitalize
      get :index

      expect(ActsAsTenant.current_tenant).not_to eq(instance)
      expect(ActsAsTenant.current_tenant).to eq(Instance.default)
    end
  end
end
