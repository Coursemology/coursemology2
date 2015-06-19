require 'rails_helper'

RSpec.describe Course::AnnouncementsController, type: :controller do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:user) { create(:administrator) }
    let!(:course) { create(:course) }
    let!(:announcement_stub) do
      stub = create(:course_announcement, course: course)
      allow(stub).to receive(:destroy).and_return(false)
      stub
    end

    before { sign_in(user) }

    describe '#destroy' do
      subject { delete :destroy, course_id: course, id: announcement_stub }

      context 'upon destroy failure' do
        before do
          controller.instance_variable_set(:@announcement, announcement_stub)
          subject
        end

        it 'redirects with a flash message' do
          it { is_expected.to redirect_to(course_announcements_path(course)) }
          expect(flash[:danger]).to eq(I18n.t('course.announcements.destroy.failure', error: ''))
        end
      end
    end
  end
end
