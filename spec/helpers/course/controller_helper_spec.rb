# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ControllerHelper do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    before(:all) do
      # This is to fix https://github.com/rspec/rspec-rails/issues/1483
      Course::ControllerHelper.include ApplicationHelper
    end

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

    describe '#link_to_user' do
      let(:course) { create(:course) }
      before do
        helper.controller.define_singleton_method(:current_course) {}
        allow(helper.controller).to receive(:current_course).and_return(course)
      end
      subject { helper.link_to_user(user) }

      context 'when a CourseUser is given' do
        let(:user) { build(:course_user) }

        it { is_expected.to eq(helper.link_to_course_user(user)) }
      end

      context 'when a User is given' do
        let(:user) { create(:user) }

        it { is_expected.to include(user.name) }

        context 'when the user is enrolled in course' do
          let!(:course_user) { create(:course_user, course: course, user: user) }

          it { is_expected.to eq(helper.link_to_course_user(course_user)) }
        end
      end
    end
  end
end
