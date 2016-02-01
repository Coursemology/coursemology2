require 'rails_helper'

RSpec.describe Course::AchievementsHelper do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:achievement) { create(:course_achievement) }

    describe '#display_achievement_badge' do
      subject { helper.display_achievement_badge(achievement) }

      context 'when an achievement badge is uploaded' do
        let(:icon) { File.join(Rails.root, '/spec/fixtures/files/picture.jpg') }
        before do
          file = File.open(icon, 'rb')
          achievement.badge = file
          file.close
        end

        it 'displays the achievement badge' do
          expect(subject).to include(achievement.badge.medium.url)
        end
      end

      context 'when an achievement badge is not uploaded' do
        it 'displays the default achievement badge' do
          expect(subject).to have_tag('img', with: { :'src^' => '/assets/achievement_blank-' })
        end
      end
    end

    describe '#display_locked_achievement_badge' do
      it 'displays the locked achievement badge' do
        expect(helper.display_locked_achievement_badge).
          to have_tag('img', with: { :'src^' => '/assets/achievement_locked-' })
      end
    end

    describe '#achievement_status_class' do
      subject { helper.achievement_status_class(achievement, course_user) }

      context 'when the course user is a staff member' do
        let(:course_user) { create(:course_teaching_assistant, course: achievement.course) }

        it 'returns an empty array' do
          expect(subject).to eq([])
          expect(helper.achievement_status_class(achievement, nil)).to eq([])
        end
      end

      context 'when the course user is a student' do
        let(:course_user) { create(:course_student, course: achievement.course) }

        it 'returns an array with the locked class' do
          expect(subject).to contain_exactly('locked')
        end

        context 'when the course user obtains the achievement' do
          before do
            create(:course_user_achievement, achievement: achievement, course_user: course_user)
          end

          it 'returns an array with the granted class' do
            expect(subject).to contain_exactly('granted')
          end
        end
      end
    end
  end
end
