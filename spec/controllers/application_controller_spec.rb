require 'rails_helper'

RSpec.describe ApplicationController, type: :controller do
  controller do
    def index
      redirect_to '/'
    end
  end

  describe ApplicationMultitenancyConcern do
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

  describe 'internationalization' do
    context 'when http accept language is present' do
      before { @request.env['HTTP_ACCEPT_LANGUAGE'] = 'zh-cn' }

      it 'sets the correct locale' do
        get :index
        expect(I18n.locale).to eq(:'zh-CN')
      end
    end

    context 'when http accept language is not present' do
      before { @request.env['HTTP_ACCEPT_LANGUAGE'] = nil }

      it 'sets the locale to default' do
        get :index
        expect(I18n.locale).to eq(I18n.default_locale)
      end
    end

    context 'when http accept language is not available' do
      before do
        @request.env['HTTP_ACCEPT_LANGUAGE'] = 'jp'
        get :index
      end

      it 'sets the locale to default' do
        expect(I18n.locale).to eq(I18n.default_locale)
      end
    end

    context 'when http accept language belongs to the same region' do
      before { @request.env['HTTP_ACCEPT_LANGUAGE'] = 'zh-tw' }

      it 'sets the nearest locale' do
        get :index
        expect(I18n.locale).to eq(:'zh-CN')
      end
    end

    context 'when multiple http accept languages are present' do
      before { @request.env['HTTP_ACCEPT_LANGUAGE'] = 'jp, zh-tw' }

      it 'sets the nearest available locale' do
        get :index
        expect(I18n.locale).to eq(:'zh-CN')
      end
    end
  end

  describe ApplicationThemingConcern do
    context 'when the instance has a theme' do
      it 'uses the theme' do
        pending 'an instance with a theme'
        fail
      end
    end

    context 'when the instance does not have a theme' do
      it 'uses the default theme' do
        expect(controller.send(:deduce_theme)).to eq('default')
      end
    end
  end
end
