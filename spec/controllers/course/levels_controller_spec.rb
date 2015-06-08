require 'rails_helper'

RSpec.describe Course::LevelsController, type: :controller do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:user) { create(:administrator) }
    let!(:course) { create(:course) }
    let!(:level_stub) do
      stub = create(:course_level, course: course)
      allow(stub).to receive(:save).and_return(false)
      stub
    end

    before { sign_in(user) }

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
