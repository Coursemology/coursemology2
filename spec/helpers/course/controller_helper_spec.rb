require 'rails_helper'

RSpec.describe Course::ControllerHelper do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '#display_course_user' do
      let(:user) { build(:course_user) }
      subject { helper.display_course_user(user) }

      it "displays the user's course name" do
        expect(subject).to eq(user.name)
      end
    end

    describe '#link_to_course_user' do
      let(:user) { build(:course_user) }
      subject { helper.link_to_course_user(user) }

      it { is_expected.to have_tag('a') }

      context 'when no block is given' do
        it { is_expected.to include(helper.display_course_user(user)) }
      end

      context 'when a block is given' do
        subject do
          helper.link_to_course_user(user) do
            'Test'
          end
        end

        it { is_expected.to include('Test') }
      end
    end
  end
end
