require 'rails_helper'

RSpec.describe ApplicationController, type: :controller do
  controller do
    def index
      redirect_to '/'
    end

    def create
      fail CanCan::AccessDenied
    end

    def publicly_accessible?
      true
    end
  end

  describe ApplicationMultitenancyConcern do
    it 'checks the host for multitenancy' do
      @request.headers['host'] = 'coursemology.org'
      get :index

      expect(ActsAsTenant.current_tenant).to eq(Instance.default)
    end

    let(:instance) { create(:instance) }

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

  describe ApplicationInternationalizationConcern do
    before { @old_i18n_locale = I18n.locale }
    after { I18n.locale = @old_i18n_locale }

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

  describe ApplicationUserConcern do
    context 'when the action raises a CanCan::AccessDenied' do
      run_rescue

      it 'renders the access denied page to /pages/403' do
        post :create
        expect(response).to render_template('pages/403')
      end

      it 'returns HTTP status 403' do
        post :create
        expect(response.status).to eq(403)
      end
    end
  end

  describe ApplicationComponentsConcern do
    context 'when the action raises a Coursemology::ComponentNotFoundError' do
      run_rescue

      before do
        def controller.index
          fail ComponentNotFoundError
        end
      end

      it 'renders the component not found page to /public/404' do
        get :index
        expect(response).to render_template(file: "#{Rails.root}/public/404.html")
      end

      it 'returns HTTP status 404' do
        get :index
        expect(response.status).to eq(404)
      end
    end
  end

  describe '#without_bullet' do
    it 'disables bullet within the block' do
      controller.send(:without_bullet) do
        expect(Bullet.enable?).to be(false)
      end
    end
  end
end
