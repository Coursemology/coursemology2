require 'rails_helper'

RSpec.describe Course::Discussion::Topic, type: :model do
  it { is_expected.to be_actable }
  it { is_expected.to have_many(:posts).inverse_of(:topic).dependent(:destroy) }
  it { is_expected.to have_many(:subscriptions).inverse_of(:topic).dependent(:destroy) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '#subscribed_by?' do
      let(:user) { create(:user) }
      let(:another_user) { create(:user) }
      let(:topic) { create(:forum_topic) }
      let!(:discussion_topic_subscription) do
        create(:discussion_topic_subscription, topic: topic.acting_as, user: user)
      end

      context 'when the user has subscribed to a topic' do
        it 'returns true' do
          expect(topic.subscribed_by?(user)).to eq(true)
        end
      end

      context 'when the user has not subscribed to a topic' do
        it 'returns false' do
          expect(topic.subscribed_by?(another_user)).to eq(false)
        end
      end
    end
  end
end
