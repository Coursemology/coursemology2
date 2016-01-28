# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::Instance::AnnouncementsController, type: :controller do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let!(:announcement_stub) do
      stub = create(:instance_announcement, instance: instance)
      allow(stub).to receive(:destroy).and_return(false)
      stub
    end

    before { sign_in(user) }

    describe '#destroy' do
      subject { delete :destroy, id: announcement_stub }

      context 'upon destroy failure' do
        before do
          controller.instance_variable_set(:@announcement, announcement_stub)
          subject
        end

        it 'redirects with a flash message' do
          it { is_expected.to redirect_to(admin_announcements_path) }
          expect(flash[:danger]).
            to eq(I18n.t('system.admin.instance.announcements.destroy.failure', error: ''))
        end
      end
    end
  end
end
