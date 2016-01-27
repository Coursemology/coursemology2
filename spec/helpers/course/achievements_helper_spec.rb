require 'rails_helper'

RSpec.describe Course::AchievementsHelper do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:achievement) { create(:course_achievement) }
    let(:icon) { File.join(Rails.root, '/spec/fixtures/files/picture.jpg') }
    before do
      file = File.open(icon, 'rb')
      achievement.badge = file
      file.close
    end

    describe '#display_achievement_badge' do
      it 'displays the achievement badge' do
        expect(helper.display_achievement_badge(achievement, size: :small)).
          to include(achievement.badge.small.url)
      end

      context 'when size is stated correctly' do
        it 'returns the image of the accurate badge size' do
          expect(helper.display_achievement_badge(achievement, size: :medium)).
            to include(achievement.badge.medium.url)
        end
      end

      context 'when size is stated incorrectly' do
        it 'returns the image of the default badge size' do
          expect(helper.display_achievement_badge(achievement, size: :foo)).
            to include(achievement.badge.small.url)
        end
      end
    end
  end
end
