# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Achievement::CourseUsersController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:user) { create(:administrator) }
    let!(:course) { create(:course) }
    let!(:achievement) { create(:course_achievement, course: course) }

    before { sign_in(user) }

    describe '#index' do
      subject { get :index, params: { course_id: course, achievement_id: achievement } }

      context 'when the achievement is automatically awarded' do
        before do
          allow(achievement).to receive(:manually_awarded?).and_return(false)
          controller.instance_variable_set(:@achievement, achievement)
        end

        it 'raises an error' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
        end
      end
    end
  end
end
