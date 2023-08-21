# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Achievement::ControllerHelper do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:achievement) { create(:course_achievement) }

    describe '#achievement_badge_path' do
      context 'when no achievement is provided' do
        subject { helper.achievement_badge_path }

        it 'returns nil' do
          expect(subject).to be_nil
        end
      end

      context 'when an achievement is provided' do
        subject { helper.achievement_badge_path(achievement) }

        context 'when an achievement badge is uploaded' do
          let(:icon) { Rails.root.join('spec', 'fixtures', 'files', 'picture.jpg') }
          before do
            file = File.open(icon, 'rb')
            achievement.badge = file
            file.close
          end

          it 'returns the path of the achievement badge' do
            expect(subject).to eq(achievement.badge.medium.url)
          end
        end

        context 'when an achievement badge is not uploaded' do
          it 'returns nil' do
            expect(subject).to be_nil
          end
        end
      end
    end

    describe '#achievement_status_class' do
      subject { helper.achievement_status_class(achievement, course_user) }

      context 'when the course user is a staff member' do
        let(:course_user) { create(:course_teaching_assistant, course: achievement.course) }

        it 'returns nil result' do
          expect(subject).to eq(nil)
          expect(helper.achievement_status_class(achievement, nil)).to eq(nil)
        end
      end

      context 'when the course user is a student' do
        let(:course_user) { create(:course_student, course: achievement.course) }

        it 'returns an array with the locked class' do
          expect(subject).to eq('locked')
        end

        context 'when the course user obtains the achievement' do
          before do
            create(:course_user_achievement, achievement: achievement, course_user: course_user)
          end

          it 'returns an array with the granted class' do
            expect(subject).to eq('granted')
          end
        end
      end
    end
  end
end
