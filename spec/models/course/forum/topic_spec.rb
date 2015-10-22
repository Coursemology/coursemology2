require 'rails_helper'

RSpec.describe Course::Forum::Topic, type: :model do
  it { is_expected.to act_as(:topic).class_name(Course::Discussion::Topic.name) }
  it { is_expected.to have_many(:views).inverse_of(:topic).dependent(:destroy) }
  it { is_expected.to belong_to(:forum).inverse_of(:topics) }
  it { is_expected.to belong_to(:creator) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '#slug_candidates' do
      let(:forum) { create(:forum) }
      let!(:first_topic) { create(:forum_topic, title: 'slug', forum: forum) }
      let!(:second_topic) { create(:forum_topic, title: 'slug', forum: forum) }

      context 'when title is unique' do
        it 'generates a slug based on the title' do
          expect(first_topic.slug).to eq('slug')
        end
      end

      context 'when title is not unique but forum id is unique' do
        it 'generates a slug based on title and forum_id' do
          expect(second_topic.slug).to eq("slug-#{forum.id}")
        end
      end
    end
  end
end
