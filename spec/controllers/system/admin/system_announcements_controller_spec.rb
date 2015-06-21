require 'rails_helper'

RSpec.describe System::Admin::SystemAnnouncementsController, type: :controller do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let!(:system_announcement_stub) do
      stub = create(:system_announcement)
      allow(stub).to receive(:destroy).and_return(false)
      stub
    end

    before { sign_in(user) }

    describe '#destroy' do
      subject { delete :destroy, id: system_announcement_stub }

      context 'upon destroy failure' do
        before do
          controller.instance_variable_set(:@system_announcement, system_announcement_stub)
          subject
        end

        it 'redirects with a flash message' do
          it { is_expected.to redirect_to(admin_system_announcements_path) }
          expect(flash[:danger]).to(eq(I18n.t('system.admin.system_announcements.destroy.failure',
                                              error: '')))
        end
      end
    end
  end
end
