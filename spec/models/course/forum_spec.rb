require 'rails_helper'

RSpec.describe Course::Forum, type: :model do
  it { is_expected.to have_many(:topics).inverse_of(:forum).dependent(:destroy) }
  it { is_expected.to have_many(:subscriptions).inverse_of(:forum).dependent(:destroy) }
  it { is_expected.to belong_to(:course).inverse_of(:forums) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '#slug_candidates' do
      let(:course) { create(:course) }
      let!(:first_forum) { create(:forum, name: 'slug', course: course) }
      let!(:second_forum) { create(:forum, name: 'slug', course: course) }

      context 'when name is unique' do
        it 'generates a slug based on the name' do
          expect(first_forum.slug).to eq('slug')
        end
      end

      context 'when name is not unique but course id is unique' do
        it 'generates a slug based on name and course_id' do
          expect(second_forum.slug).to eq("slug-#{course.id}")
        end
      end
    end
  end
end
