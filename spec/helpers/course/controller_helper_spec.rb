# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ControllerHelper do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    before(:all) do
      # This is to fix https://github.com/rspec/rspec-rails/issues/1483
      Course::ControllerHelper.include ApplicationHelper
    end
    before(:each) do
      # This is to mock a Course::ComponentController
      test = self
      controller.define_singleton_method(:current_course) { test.course }
      helper.singleton_class.class_eval do
        delegate :current_course, :current_component_host, to: :controller
      end
    end

    describe '#display_course_user' do
      let(:user) { build(:course_user, course: course) }
      subject { helper.display_course_user(user) }

      it "displays the user's course name" do
        expect(subject).to eq(user.name)
      end
    end

    describe '#display_user' do
      let(:user) { create(:user, name: 'user') }
      let(:course_user) { create(:course_user, course: course, user: user, name: 'course_user') }
      subject { helper.display_user(user) }

      context 'when the given user is a course_user in the current course' do
        it 'returns the name of the course user' do
          course_user
          expect(subject).to eq(course_user.name)
        end
      end

      context 'when the given user is not a course_user in the current course' do
        it 'returns the name of the user' do
          user
          expect(subject).to eq(user.name)
        end
      end
    end

    describe '#link_to_course_user' do
      let(:user) { create(:course_student, course: course) }
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
      subject { helper.link_to_user(user) }

      context 'when a CourseUser is given' do
        let(:user) { create(:course_user) }

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

    describe '#display_course_logo' do
      subject { helper.display_course_logo(course) }

      context 'when no course logo is uploaded' do
        it 'displays the default course logo' do
          expect(subject).to have_tag('img', with: { 'src^': '/assets/course_default_logo-' })
        end
      end

      context 'when a course logo is uploaded' do
        let(:logo) { File.join(Rails.root, '/spec/fixtures/files/picture.jpg') }
        before do
          file = File.open(logo, 'rb')
          course.logo = file
          file.close
        end

        it 'displays the course logo' do
          expect(subject).to include(course.logo.medium.url)
        end
      end
    end
  end
end
