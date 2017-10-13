# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LevelsController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:user) { create(:administrator) }
    let!(:course) { create(:course) }
    let!(:level_stub) do
      stub = create(:course_level, course: course)
      allow(stub).to receive(:save).and_return(false)
      allow(stub).to receive(:destroy).and_return(false)
      stub
    end

    before { sign_in(user) }

    describe '#destroy' do
      subject { delete :destroy, params: { course_id: course, id: level_stub } }

      context 'when destroy fails' do
        before do
          controller.instance_variable_set(:@level, level_stub)
          subject
        end

        it { is_expected.to redirect_to(course_levels_path(course)) }
        it 'sets an error flash message' do
          expect(flash[:danger]).to eq(I18n.t('course.levels.destroy.failure', error: ''))
        end
      end
    end

    describe '#save' do
      subject { post :create, params: { course_id: course, level: level_stub } }

      context 'when saving fails' do
        before do
          controller.instance_variable_set(:@level, level_stub)
          subject
        end

        it { is_expected.to render_template('new') }
      end
    end
  end
end
