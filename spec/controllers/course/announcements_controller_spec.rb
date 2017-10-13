# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::AnnouncementsController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:user) { create(:administrator) }
    let!(:course) { create(:course) }
    let!(:announcement_stub) do
      stub = create(:course_announcement, course: course)
      allow(stub).to receive(:destroy).and_return(false)
      stub
    end

    before { sign_in(user) }

    describe '#index' do
      context 'when announcements component is disabled' do
        before do
          allow(controller).
            to receive_message_chain('current_component_host.[]').and_return(nil)
        end
        subject { get :index, params: { course_id: course } }
        it 'raises an component not found error' do
          expect { subject }.to raise_error(ComponentNotFoundError)
        end
      end
    end

    describe '#destroy' do
      subject { delete :destroy, params: { course_id: course, id: announcement_stub } }

      context 'upon destroy failure' do
        before do
          controller.instance_variable_set(:@announcement, announcement_stub)
          subject
        end

        it { is_expected.to redirect_to(course_announcements_path(course)) }
        it 'sets an error flash message' do
          expect(flash[:danger]).to eq(I18n.t('course.announcements.destroy.failure', error: ''))
        end
      end
    end
  end
end
