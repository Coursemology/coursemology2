# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LecturesController, type: :controller do
  let!(:instance) { create(:instance, :with_lecture_component_enabled) }

  with_tenant(:instance) do
    let!(:user) { create(:administrator) }
    let!(:course) { create(:course, :with_lecture_component_enabled) }
    let!(:lecture_stub) do
      stub = create(:course_lecture, course: course)
      allow(stub).to receive(:destroy).and_return(false)
      stub
    end

    before { sign_in(user) }

    describe '#index' do
      context 'when lectures component is disabled' do
        before do
          allow(controller).
            to receive_message_chain('current_component_host.[]').and_return(nil)
        end
        subject { get :index, course_id: course }
        it 'raises an component not found error' do
          expect { subject }.to raise_error(ComponentNotFoundError)
        end
      end
    end

    describe '#destroy' do
      subject { delete :destroy, course_id: course, id: lecture_stub }

      context 'upon destroy failure' do
        before do
          controller.instance_variable_set(:@lecture, lecture_stub)
          subject
        end

        it { is_expected.to redirect_to(course_lectures_path(course)) }
        it 'sets an error flash message' do
          expect(flash[:danger]).to eq(I18n.t('course.lectures.destroy.failure', error: ''))
        end
      end
    end
  end
end
