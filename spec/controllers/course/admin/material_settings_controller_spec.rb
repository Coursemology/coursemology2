# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Admin::MaterialSettingsController, type: :controller do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    before { sign_in(user) }

    describe '#edit' do
      subject { get :edit, course_id: course }
      it { is_expected.to render_template(:edit) }
    end

    describe '#update' do
      before do
        allow(course).to receive(:save).and_return(false)
        allow(controller).to receive(:current_course).and_return(course)
      end
      context 'when course cannot be saved' do
        subject { patch :update, course_id: course, material_settings: { title: '' } }
        it { is_expected.to render_template(:edit) }
      end
    end
  end
end
