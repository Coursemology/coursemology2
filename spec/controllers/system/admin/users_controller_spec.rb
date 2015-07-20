require 'rails_helper'

RSpec.describe System::Admin::UsersController, type: :controller do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    let(:instance_admin) do
      user = create(:user)
      create(:instance_user, instance: instance, user: user, role: :administrator)
      user
    end
    let(:normal_user) do
      user = create(:user)
      create(:instance_user, instance: instance, user: user, role: :normal)
      user
    end

    describe '#index' do
      subject { get :index }

      context 'when a system administrator visits the page' do
        before { sign_in(admin) }

        it { is_expected.to render_template(:index) }
      end

      context 'when an instance administrator visits the page' do
        before { sign_in(instance_admin) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a normal user visits the page' do
        before { sign_in(normal_user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end
  end
end
