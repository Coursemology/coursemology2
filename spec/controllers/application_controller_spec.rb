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

  let(:instance) { create(:instance) }
  describe ApplicationControllerMultitenancyConcern do
    # These variables override the hostname in the selected tenant object before with_tenant gets
    # to execute. This effectively changes the host requested in the mock request.
    let(:instance_host) { instance.host }
    prepend_before { instance.host = instance_host }

    with_tenant(:instance) do
      context 'when a nonexistent instance is specified' do
        let(:instance) { build_stubbed(:instance) }
        it 'raises a RoutingError' do
          expect { get :index }.to raise_error(ActionController::RoutingError)
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
          it 'raises a RoutingError' do
            expect { get :index }.to raise_error(ActionController::RoutingError)
          end
        end
      end
    end
  end

  describe 'ApplicationControllerMultitenancyConcern#deduce_tenant_host' do
    subject { controller.send(:deduce_tenant_host) }

    before do
      allow(Instance).to receive(:default).
        and_return(instance_double(Instance, host: 'staging.coursemology.org'))
    end

    context 'when the host has a www prefix' do
      before { @request.host = 'www.example.com' }

      it { is_expected.to eq('example.com') }
    end

    context 'when the host exactly matches the default host' do
      before { @request.host = 'staging.coursemology.org' }

      it { is_expected.to eq('staging.coursemology.org') }
    end

    context 'when the host is a subdomain of the default host' do
      before { @request.host = 'tenant.staging.coursemology.org' }

      it { is_expected.to eq('tenant.coursemology.org') }
    end

    context 'when the host has a www prefix and is a subdomain of the default host' do
      before { @request.host = 'www.tenant.staging.coursemology.org' }

      it { is_expected.to eq('tenant.coursemology.org') }
    end

    context 'when the host is unrelated to the default host' do
      before { @request.host = 'tenant.example.com' }

      it { is_expected.to eq('tenant.example.com') }
    end
  end

  describe ApplicationInternationalizationConcern do
    with_tenant(:instance) do
      before { @old_i18n_locale = I18n.locale }
      after { I18n.locale = @old_i18n_locale }

      context 'when http accept language is present' do
        before { @request.env['HTTP_ACCEPT_LANGUAGE'] = 'zh' }

        it 'sets the correct locale' do
          get :index
          expect(I18n.locale).to eq(:zh)
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
  end

  describe ApplicationUserConcern do
    with_tenant(:instance) do
      context 'when the action raises a CanCan::AccessDenied' do
        run_rescue

        it 'returns HTTP status 403' do
          post :create
          expect(response.status).to eq(403)
        end
      end
    end
  end

  describe ApplicationComponentsConcern do
    with_tenant(:instance) do
      context 'when the action raises a Coursemology::ComponentNotFoundError' do
        run_rescue

        before do
          def controller.index
            raise ComponentNotFoundError
          end
        end

        it 'returns HTTP status 404' do
          get :index
          expect(response.status).to eq(404)
          expect(response.body).to include('Component not found')
        end
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
    with_tenant(:instance) do
      run_rescue

      before do
        def controller.index
          raise IllegalStateError
        end
      end

      it 'returns HTTP status 422' do
        get :index
        expect(response.status).to eq(422)
      end
    end
  end

  context 'when the action raises ActionController::InvalidAuthenticityToken' do
    with_tenant(:instance) do
      run_rescue

      before do
        def controller.index
          raise ActionController::InvalidAuthenticityToken
        end
      end

      it 'returns HTTP status 403' do
        # Replaced specific error check due to potential false positives
        # expect { get :index }.to_not raise_error ActionController::InvalidAuthenticityToken
        expect { get :index }.to_not raise_error
        expect(response.status).to eq(403)
      end
    end
  end

  describe '#index with a marketplace container present' do
    render_views

    let(:instance) { Instance.default }

    with_tenant(:instance) do
      let(:user) { create(:user) }
      let!(:ordinary) { create(:course, instance: instance) }
      let!(:container) do
        Course::Assessment::Marketplace::ContainerCourseService.
          find_or_create!(instance: instance, creator: create(:administrator))
      end

      before do
        controller.singleton_class.define_method(:index) do
          render template: 'application/index', formats: :json
        end
        create(:course_manager, course: ordinary, user: user)
        # Enrolling the previewer as a manager is exactly what a preview does — and is what would
        # otherwise put the sandbox in their course switcher.
        Course::Assessment::Marketplace::PreviewEnrolmentService.
          ensure_manager!(course: container, user: user)
        controller_sign_in(controller, user)
      end

      it 'omits the marketplace container from the user’s own courses' do
        get :index, format: :json

        ids = response.parsed_body['courses'].map { |course| course['id'] }
        expect(ids).to include(ordinary.id)
        expect(ids).not_to include(container.id)
      end
    end
  end
end
