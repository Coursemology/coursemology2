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

    describe '#display_course_user_badge' do
      let(:user) { create(:course_user) }
      subject { helper.display_course_user_badge(user) }

      context 'when the levels component is enabled in the course' do
        before do
          helper.controller.define_singleton_method(:current_component_host) do
            { course_achievements_component: nil,
              course_levels_component: 'foo' }
          end
        end

        context 'when course user has experience points' do
          before do
            create(:course_level, course: user.course, experience_points_threshold: 100)
            create(:course_level, course: user.course, experience_points_threshold: 200)
            create(:course_experience_points_record, points_awarded: 140, course_user: user)
          end

          it "shows the course user's experience points" do
            expect(subject).to include(I18n.t('layouts.course_user_badge.progress'))
          end

          it "shows the course user's level number" do
            expect(subject).to include(user.level_number.to_s)
          end

          it 'displays the progress bar with current level progress' do
            expect(helper).to receive(:display_progress_bar).
              with(user.level_progress_percentage,
                   ['progress-bar-info', 'progress-bar-striped',
                    'course-user-experience-points'])
            subject
          end
        end
      end

      context 'when the achievements component is enabled in the course' do
        before do
          helper.controller.define_singleton_method(:current_component_host) do
            { course_achievements_component: 'bar',
              course_levels_component: nil }
          end
        end

        context 'when course user has a number of achievements' do
          before { create_list(:course_user_achievement, 3, course_user: user) }

          it "displays the achievement tab with the course user's achievement count" do
            expect(subject).to include(I18n.t('layouts.course_user_badge.achievements'))
            expect(subject).to include(user.achievement_count.to_s)
          end
        end
      end

      context 'when levels and achievement components are disabled' do
        before do
          helper.controller.define_singleton_method(:current_component_host) do
            { course_achievements_component: nil,
              course_levels_component: nil }
          end
        end

        it 'does not display the level of the course user' do
          expect(subject).not_to include(I18n.t('layouts.course_user_badge.levels'))
        end

        it 'does not display the achievement tab' do
          expect(subject).not_to include(I18n.t('layouts.course_user_badge.achievements'))
        end
      end
    end

    describe '#display_course_logo' do
      let(:course) { create(:course) }
      subject { helper.display_course_logo(course) }

      context 'when no course logo is uploaded' do
        it 'displays the default course logo' do
          expect(subject).to have_tag('img', with: { :'src^' => '/assets/course_default_logo-' })
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
