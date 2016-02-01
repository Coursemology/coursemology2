require 'rails_helper'

RSpec.describe Course::AchievementsHelper do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:achievement) { create(:course_achievement) }

    describe '#display_achievement_badge' do
      context 'when an achievement badge is uploaded' do
        let(:icon) { File.join(Rails.root, '/spec/fixtures/files/picture.jpg') }
        before do
          file = File.open(icon, 'rb')
          achievement.badge = file
          file.close
        end

        it 'displays the achievement badge' do
          expect(helper.display_achievement_badge(achievement)).
            to include(achievement.badge.medium.url)
        end
      end

      context 'when an achievement badge is not uploaded' do
        it 'displays the default achievement badge' do
          expect(helper.display_achievement_badge(achievement)).
            to have_tag('img', with: { :'src^' => '/assets/achievement_blank-' })
        end
      end
    end

    describe '#display_locked_achievement_badge' do
      it 'displays the locked achievement badge' do
        expect(helper.display_locked_achievement_badge).
          to have_tag('img', with: { :'src^' => '/assets/achievement_locked-' })
      end
    end
  end
end
