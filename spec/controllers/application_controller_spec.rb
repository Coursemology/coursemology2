# frozen_string_literal: true
require 'rails_helper'

RSpec.describe ApplicationController, type: :controller do
  controller do
    def index
      redirect_to '/'
    end

    def create
      raise CanCan::AccessDenied
    end

    def publicly_accessible?
      true
    end
  end

  describe ApplicationMultitenancyConcern do
    # These variables override the hostname in the selected tenant object before with_tenant gets
    # to execute. This effectively changes the host requested in the mock request.
    let(:instance_host) { instance.host }
    prepend_before { instance.host = instance_host }

    with_tenant(:instance) do
      context 'when a nonexistent instance is specified' do
        let(:instance) { build_stubbed(:instance) }
        it 'falls back to the default instance' do
          get :index

          expect(ActsAsTenant.current_tenant).to eq(Instance.default)
        end
      end

      context 'when a host is specified' do
        let(:instance) { create(:instance) }
        context 'when the host is specified in the wrong case' do
          let(:instance_host) { instance.host.upcase! }
          it 'finds the host with case-insensitivity' do
            get :index

            expect(ActsAsTenant.current_tenant).to eq(instance)
          end
        end

        context 'when the host has a www subdomain' do
          let(:instance_host) { "www.#{instance.host.upcase}" }
          it 'finds the host without the www subdomain' do
            get :index

            expect(ActsAsTenant.current_tenant).to eq(instance)
          end
        end

        context 'when the host has a subdomain other than www' do
          let(:instance_host) { "random.#{instance.host.upcase}" }
          it 'finds the actual host' do
            get :index

            expect(ActsAsTenant.current_tenant).not_to eq(instance)
            expect(ActsAsTenant.current_tenant).to eq(Instance.default)
          end
        end
      end
    end
  end

  describe ApplicationInternationalizationConcern do
    before { @old_i18n_locale = I18n.locale }
    after { I18n.locale = @old_i18n_locale }

    pending 'when http accept language is present' do
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

    pending 'when http accept language belongs to the same region' do
      before { @request.env['HTTP_ACCEPT_LANGUAGE'] = 'zh-tw' }

      it 'sets the nearest locale' do
        get :index
        expect(I18n.locale).to eq(:'zh-CN')
      end
    end

    pending 'when multiple http accept languages are present' do
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
        raise
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
          raise ComponentNotFoundError
        end
      end

      it 'renders the component not found page to /public/404' do
        get :index
        expect(response).to render_template(file: Rails.root.join('public', '404.html').to_s)
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

  context 'when the action raises an IllegalStateError' do
    run_rescue

    before do
      def controller.index
        raise IllegalStateError
      end
    end

    it 'renders the request rejected page /public/422' do
      get :index
      expect(response).to render_template(file: Rails.root.join('public', '422.html').to_s)
    end

    it 'returns HTTP status 422' do
      get :index
      expect(response.status).to eq(422)
    end

    context 'when the request only accepts a json response' do
      before { request.accept = 'application/json' }

      it 'renders the correct template' do
        get :index
        expect(response.body).to eq(File.read(Rails.root.join('public', '422.json').to_s))
      end
    end
  end

  context 'when the action raises ActionController::InvalidAuthenticityToken' do
    run_rescue

    before do
      def controller.index
        raise ActionController::InvalidAuthenticityToken
      end
    end

    it 'renders the request rejected page /public/403' do
      get :index
      expect(response).to render_template(file: Rails.root.join('public', '403.html').to_s)
    end

    it 'returns HTTP status 403' do
      expect { get :index }.to_not raise_error ActionController::InvalidAuthenticityToken
      expect(response.status).to eq(403)
    end

    context 'when the request only accepts a json response' do
      before { request.accept = 'application/json' }

      it 'renders the correct template' do
        get :index
        expect(response.body).to eq(File.read(Rails.root.join('public', '403.json').to_s))
      end
    end
  end
end
