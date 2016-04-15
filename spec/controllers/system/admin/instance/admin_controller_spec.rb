# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::Instance::AdminController do
  # Test if administrator can visit the management page of the default instance.
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    before { sign_in(user) }

    describe '#index' do
      subject { get :index }
      context 'when a system administrator visits the page' do
        let(:user) { create(:administrator) }
        it { is_expected.to render_template(:index) }
      end

      context 'when an instance administrator visits the page' do
        let(:user) { create(:instance_user, role: :administrator).user }
        it { is_expected.to render_template(:index) }
      end

      context 'when a normal user visits the page' do
        let(:user) { create(:user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end
  end
end
