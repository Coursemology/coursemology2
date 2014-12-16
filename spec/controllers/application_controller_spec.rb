require 'rails_helper'

RSpec.describe ApplicationController, type: :controller do
  controller do
    def index
      redirect_to '/'
    end
  end

  describe 'multitenancy' do
    it 'checks the host for multitenancy' do
      @request.headers['host'] = 'coursemology.org'
      get :index

      expect(ActsAsTenant.current_tenant).to eq(Instance.default)
    end

    let(:instance) do
      default_instance = Instance.default
      Instance.where { id << [default_instance] }.take
    end

    it 'checks hosts in a case insensitive manner' do
      @request.headers['host'] = instance.host.upcase
      get :index

      expect(ActsAsTenant.current_tenant).to eq(instance)
    end

    it 'accepts www as a default subdomain' do
      @request.headers['host'] = 'www.' + instance.host.capitalize
      get :index

      expect(ActsAsTenant.current_tenant).to eq(instance)
    end

    it 'does not recognise any subdomain other than www' do
      @request.headers['host'] = 'random.' + instance.host.capitalize
      get :index

      expect(ActsAsTenant.current_tenant).not_to eq(instance)
      expect(ActsAsTenant.current_tenant).to eq(Instance.default)
    end
  end
end
