require 'rails_helper'

RSpec.describe Course::LevelsController, type: :controller do
  let!(:instance) { create(:instance) }

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
      subject { delete :destroy, course_id: course, id: level_stub }

      context 'upon destroy failure' do
        before do
          controller.instance_variable_set(:@level, level_stub)
          subject
        end

        it { is_expected.to redirect_to(course_levels_path(course)) }
      end
    end

    describe '#save' do
      subject { post :create, course_id: course, level: level_stub }

      context 'upon save failure' do
        before do
          controller.instance_variable_set(:@level, level_stub)
          subject
        end

        it { is_expected.to render_template('new') }
      end
    end
  end
end
